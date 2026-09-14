import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

type User = { id: string; name: string; email: string; role: 'student' | 'admin' };
const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'notebridge-local-development-secret';
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined }) : null;
const demoPasswordHash = bcrypt.hashSync('NoteBridge123!', 10);
const demoUser = { id: 'demo-student', name: 'Nirjhar Saha', email: 'student@notebridge.edu', role: 'student' as const, passwordHash: demoPasswordHash };

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const issueToken = (user: User) => jwt.sign(user, jwtSecret, { expiresIn: '7d' });

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'notebridge-api' }));

app.post('/api/auth/login', async (request: Request, response: Response) => {
  const { email, password, name } = request.body as { email?: string; password?: string; name?: string };
  if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  let user: User & { passwordHash: string } | null = null;

  if (pool) {
    const result = await pool.query('SELECT id, name, email, role, password_hash AS "passwordHash" FROM users WHERE lower(email) = $1 LIMIT 1', [normalizedEmail]);
    user = result.rows[0] ?? null;
  } else if (normalizedEmail === demoUser.email) {
    user = demoUser;
  }

  if (!user && normalizedEmail === demoUser.email) user = demoUser;
  if (!user) return response.status(401).json({ message: 'No verified student account was found for that email.' });
  if (!(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ message: 'The password is incorrect.' });
  const safeUser: User = { id: user.id, name: user.name, email: user.email, role: user.role };
  return response.json({ user: safeUser, token: issueToken(safeUser) });
});

app.post('/api/auth/register', async (request: Request, response: Response) => {
  const { email, password, name } = request.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) return response.status(400).json({ message: 'Name, university email, and password are required.' });
  if (!email.toLowerCase().endsWith('.edu')) return response.status(400).json({ message: 'Use your university email address to create an account.' });
  if (!pool) return response.status(201).json({ user: { id: 'local-student', name, email, role: 'student' }, token: issueToken({ id: 'local-student', name, email, role: 'student' }) });
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, lower($2), $3, \'student\') RETURNING id, name, email, role', [name.trim(), email.trim(), passwordHash]);
  const user = result.rows[0] as User;
  return response.status(201).json({ user, token: issueToken(user) });
});

app.listen(port, () => console.log(`NoteBridge API listening on http://localhost:${port}`));
