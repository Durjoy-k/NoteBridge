# NoteBridge

Student-driven university resource sharing platform.

## Stack

- React + TypeScript + Vite
- Tailwind CSS 4 + handcrafted responsive UI
- Express + TypeScript API
- PostgreSQL-ready authentication
- JWT + bcrypt password authentication
- University-domain email gate for registration and login
- One-time email verification code before account activation

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

### University authentication

The API enforces university email addresses for both registration and login. For a real deployment, set `UNIVERSITY_EMAIL_DOMAINS` in `.env` to an explicit comma-separated allowlist, for example:

```env
UNIVERSITY_EMAIL_DOMAINS=youruniversity.edu,students.youruniversity.edu
```

The current local fallback accepts common academic endings such as `.edu`, `.ac.uk`, `.ac.bd`, and `.edu.bd`. This domain gate does not yet prove mailbox ownership; production email verification codes or links should be added before launch.

### Email ownership verification

Registration now creates a pending account and sends a one-time six-digit verification code. In local development without `RESEND_API_KEY`, the API prints the code in the server terminal and includes it in the development response so the flow can be tested. For real email delivery, configure `RESEND_API_KEY` and a verified `EMAIL_FROM` address. If the database already existed before this feature, apply the new columns in `server/schema.sql` before starting registration.
