## Summary
Fixed backend and frontend issues in the User Management System.

## Backend
- Fixed N+1 query problem in `/api/users` by using a single aggregated query
- Added CORS configuration for frontend access
- Ensured environment variables are loaded before DB connection

## Frontend
- Fixed API URL mismatch (`/users` -> `/api/users`)
- Fixed infinite re-render due to missing dependency array in `useEffect`
- Improved user creation form UX (disable submit while loading, clear fields after success, refresh list)

## Result
Application runs correctly end-to-end with expected behavior and performance.
