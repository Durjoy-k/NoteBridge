import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { createHash, randomInt } from 'node:crypto';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

type User = { id: string; name: string; email: string; role: 'student' | 'admin' };
type PendingVerification = { name: string; email: string; passwordHash: string; codeHash: string; expiresAt: number };
const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'notebridge-local-development-secret';
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined }) : null;
const demoPasswordHash = bcrypt.hashSync('NoteBridge123!', 10);
const demoUser = { id: 'demo-student', name: 'Nirjhar Saha', email: 'student@notebridge.edu', role: 'student' as const, passwordHash: demoPasswordHash };
const pendingVerifications = new Map<string, PendingVerification>();
const localUsers = new Map<string, User & { passwordHash: string }>();
const verificationLifetimeMs = 15 * 60 * 1000;
const emailFrom = process.env.EMAIL_FROM ?? 'NoteBridge <onboarding@resend.dev>';
const configuredUniversityDomains = (process.env.UNIVERSITY_EMAIL_DOMAINS ?? '')
  .split(',')
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

const isUniversityEmail = (value: string) => {
  const email = value.trim().toLowerCase();
  const match = email.match(/^[^\s@]+@([^\s@]+)$/);
  if (!match) return false;
  const domain = match[1];

  if (configuredUniversityDomains.length > 0) {
    return configuredUniversityDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
  }

  // Safe local default: accept common academic domain patterns until the
  // deployment sets UNIVERSITY_EMAIL_DOMAINS to its real university domain.
  return domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.ac.bd') || domain.endsWith('.edu.bd');
};

const universityEmailMessage = 'Use your university email address. Personal email providers are not accepted.';
const hashVerificationCode = (code: string) => createHash('sha256').update(code).digest('hex');
const createVerificationCode = () => randomInt(100000, 1000000).toString();

const sendVerificationCode = async (email: string, name: string, code: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[NoteBridge] Email verification code for ${email}: ${code}`);
    return;
  }

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: emailFrom,
      to: [email],
      subject: 'Verify your NoteBridge account',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Welcome to NoteBridge, ${name}.</h2><p>Use this one-time code to verify your university email:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 15 minutes.</p></div>`,
    }),
  });
  if (!result.ok) throw new Error('Unable to send the verification email.');
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const issueToken = (user: User) => jwt.sign(user, jwtSecret, { expiresIn: '7d' });

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'notebridge-api' }));

app.post('/api/auth/login', async (request: Request, response: Response) => {
  const { email, password, name } = request.body as { email?: string; password?: string; name?: string };
  if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (!isUniversityEmail(normalizedEmail)) return response.status(403).json({ message: universityEmailMessage });
  let user: User & { passwordHash: string } | null = null;

  if (pool) {
    const result = await pool.query('SELECT id, name, email, role, password_hash AS "passwordHash", email_verified AS "emailVerified" FROM users WHERE lower(email) = $1 LIMIT 1', [normalizedEmail]);
    user = result.rows[0] ?? null;
  } else if (normalizedEmail === demoUser.email) {
    user = demoUser;
  } else {
    user = localUsers.get(normalizedEmail) ?? null;
  }

  if (!user && normalizedEmail === demoUser.email) user = demoUser;
  if (!user) return response.status(401).json({ message: 'No verified student account was found for that email.' });
  if ('emailVerified' in user && user.emailVerified === false) return response.status(403).json({ message: 'Verify your university email before signing in.' });
  if (!(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ message: 'The password is incorrect.' });
  const safeUser: User = { id: user.id, name: user.name, email: user.email, role: user.role };
  return response.json({ user: safeUser, token: issueToken(safeUser) });
});

app.post('/api/auth/register', async (request: Request, response: Response) => {
  const { email, password, name } = request.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) return response.status(400).json({ message: 'Name, university email, and password are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (!isUniversityEmail(normalizedEmail)) return response.status(400).json({ message: universityEmailMessage });
  if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters.' });
  const cleanName = name.trim();
  if (cleanName.length < 2) return response.status(400).json({ message: 'Enter your full name.' });
  const code = createVerificationCode();
  const expiresAt = Date.now() + verificationLifetimeMs;
  const passwordHash = await bcrypt.hash(password, 12);
  if (!pool) {
    if (localUsers.has(normalizedEmail)) return response.status(409).json({ message: 'An account already exists for this university email.' });
    pendingVerifications.set(normalizedEmail, { name: cleanName, email: normalizedEmail, passwordHash, codeHash: hashVerificationCode(code), expiresAt });
    await sendVerificationCode(normalizedEmail, cleanName, code);
    return response.status(202).json({ requiresVerification: true, email: normalizedEmail, ...(process.env.RESEND_API_KEY ? {} : { verificationCode: code }) });
  }
  try {
    await pool.query('INSERT INTO users (name, email, password_hash, role, email_verified, verification_code_hash, verification_expires_at) VALUES ($1, $2, $3, \'student\', FALSE, $4, to_timestamp($5 / 1000.0))', [cleanName, normalizedEmail, passwordHash, hashVerificationCode(code), expiresAt]);
    await sendVerificationCode(normalizedEmail, cleanName, code);
    return response.status(202).json({ requiresVerification: true, email: normalizedEmail });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return response.status(409).json({ message: 'An account already exists for this university email.' });
    }
    throw error;
  }
});

app.post('/api/auth/verify-email', async (request: Request, response: Response) => {
  const { email, code } = request.body as { email?: string; code?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !code) return response.status(400).json({ message: 'Email and verification code are required.' });
  if (!isUniversityEmail(normalizedEmail)) return response.status(403).json({ message: universityEmailMessage });

  if (!pool) {
    const pending = pendingVerifications.get(normalizedEmail);
    if (!pending || pending.expiresAt < Date.now()) return response.status(400).json({ message: 'That verification code has expired. Request a new one.' });
    if (pending.codeHash !== hashVerificationCode(code.trim())) return response.status(400).json({ message: 'That verification code is incorrect.' });
    pendingVerifications.delete(normalizedEmail);
    const user: User = { id: 'local-student', name: pending.name, email: pending.email, role: 'student' };
    localUsers.set(normalizedEmail, { ...user, passwordHash: pending.passwordHash });
    return response.json({ user, token: issueToken(user) });
  }

  const result = await pool.query('SELECT id, name, email, role, verification_code_hash AS "codeHash", verification_expires_at AS "expiresAt", email_verified AS "emailVerified" FROM users WHERE lower(email) = $1 LIMIT 1', [normalizedEmail]);
  const record = result.rows[0];
  if (!record) return response.status(404).json({ message: 'No pending account was found for that email.' });
  if (record.emailVerified) return response.status(400).json({ message: 'This email is already verified. You can sign in.' });
  if (!record.expiresAt || new Date(record.expiresAt).getTime() < Date.now()) return response.status(400).json({ message: 'That verification code has expired. Request a new one.' });
  if (record.codeHash !== hashVerificationCode(code.trim())) return response.status(400).json({ message: 'That verification code is incorrect.' });
  await pool.query('UPDATE users SET email_verified = TRUE, verification_code_hash = NULL, verification_expires_at = NULL WHERE id = $1', [record.id]);
  const user: User = { id: record.id, name: record.name, email: record.email, role: record.role };
  return response.json({ user, token: issueToken(user) });
});

app.post('/api/auth/resend-verification', async (request: Request, response: Response) => {
  const { email } = request.body as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !isUniversityEmail(normalizedEmail)) return response.status(400).json({ message: universityEmailMessage });
  const code = createVerificationCode();
  const expiresAt = Date.now() + verificationLifetimeMs;

  if (!pool) {
    const pending = pendingVerifications.get(normalizedEmail);
    if (!pending) return response.status(404).json({ message: 'No pending account was found for that email.' });
    pending.codeHash = hashVerificationCode(code); pending.expiresAt = expiresAt;
    await sendVerificationCode(normalizedEmail, pending.name, code);
    return response.json({ message: 'A new verification code was sent.', ...(process.env.RESEND_API_KEY ? {} : { verificationCode: code }) });
  }

  const result = await pool.query('SELECT id, name, email, email_verified AS "emailVerified" FROM users WHERE lower(email) = $1 LIMIT 1', [normalizedEmail]);
  const user = result.rows[0];
  if (!user || user.emailVerified) return response.status(404).json({ message: 'No pending account was found for that email.' });
  await pool.query('UPDATE users SET verification_code_hash = $1, verification_expires_at = to_timestamp($2 / 1000.0) WHERE id = $3', [hashVerificationCode(code), expiresAt, user.id]);
  await sendVerificationCode(normalizedEmail, user.name, code);
  return response.json({ message: 'A new verification code was sent.' });
});

app.listen(port, () => console.log(`NoteBridge API listening on http://localhost:${port}`));
