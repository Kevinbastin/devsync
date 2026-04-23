# Deployment

## Recommended setup

- Frontend: Vercel or Render
- Backend: Render
- Database: Neon, Supabase, or Render Postgres

This app is split into two services:

- [frontend](frontend) — Next.js app
- [backend](backend) — Express API and Socket.io server

## Required environment variables

### Backend

Set these in the backend hosting service:

- `DATABASE_URL`
- `FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GROQ_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend

Set these in the frontend hosting service:

- `NEXT_PUBLIC_API_URL` — backend API base URL, for example `https://api.example.com/api`
- `NEXT_PUBLIC_SOCKET_URL` — backend Socket.io URL, for example `https://api.example.com`
- `BACKEND_URL` — backend origin used by the Next.js rewrite, for example `https://api.example.com`

## Deploy backend

1. Create a Postgres database.
2. Create a web service from the [backend](backend) folder.
3. Use these commands:
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add the backend environment variables listed above.
5. Run Prisma against the deployed database:
   - `npx prisma db push` for a simple schema sync, or
   - `npx prisma migrate deploy` if you add migrations later.

## Deploy frontend

1. Create a web service from the [frontend](frontend) folder.
2. Use these commands:
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Add the frontend environment variables listed above.
4. Set `FRONTEND_URL` on the backend to the final frontend domain.

## Notes

- The backend uses Socket.io, so deploy it to a platform that supports long-lived connections.
- After deployment, verify these endpoints:
  - `https://your-backend/api/health`
  - frontend sign-in and workspace loading
