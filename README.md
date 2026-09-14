# NoteBridge

Student-driven university resource sharing platform.

## Stack

- React + TypeScript + Vite
- Tailwind CSS 4 + handcrafted responsive UI
- Express + TypeScript API
- PostgreSQL-ready authentication
- JWT + bcrypt password authentication

## Run locally

1. Install Node.js 20+.
2. Run `npm install` from the project root.
3. Copy `.env.example` to `.env` if you want to configure PostgreSQL.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

### Windows one-click launch

Double-click `run.bat` in the project folder. It checks for Node.js, installs missing dependencies automatically, starts the frontend and API, and opens the homepage in your browser. Keep the terminal window open while using the app.

Routes:

- `/` — public NoteBridge homepage
- `/login` — sign-in page
- `/register` — student registration
- `/dashboard` — authenticated student dashboard

The development API includes a safe demo account when `DATABASE_URL` is not configured:

- Email: `student@notebridge.edu`
- Password: `NoteBridge123!`

The demo fallback is only for local development. For a real environment, configure `DATABASE_URL`, apply `server/schema.sql`, and set a strong `JWT_SECRET`.
