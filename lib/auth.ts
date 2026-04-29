import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'mini_crm_session';

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [method, salt, storedHash] = passwordHash.split('$');

  if (method !== 'scrypt' || !salt || !storedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function createSessionToken(user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
}) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      iat: Date.now(),
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}