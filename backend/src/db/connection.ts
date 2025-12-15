import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error(
          'DATABASE_URL is required in production. Please set it in the environment variables.'
        );
      })()
    : 'postgresql://dev_user:dev_password@localhost:5433/user_management');

const pool = new Pool({
  connectionString,
});

export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();
    return pool;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export default pool;
