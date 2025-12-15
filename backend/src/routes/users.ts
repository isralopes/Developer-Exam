import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// GET all users with their posts
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.department,
        u.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'user_id', p.user_id,
              'title', p.title,
              'content', p.content,
              'created_at', p.created_at
            )
            ORDER BY p.created_at DESC
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS posts
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET single user by ID (optimized - consistent with aggregation pattern)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.department,
        u.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'user_id', p.user_id,
              'title', p.title,
              'content', p.content,
              'created_at', p.created_at
            )
            ORDER BY p.created_at DESC
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS posts
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, department) VALUES ($1, $2, $3) RETURNING *",
      [name, email, department || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle duplicate email error
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
