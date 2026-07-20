import crypto from 'node:crypto';

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}

export function verifyPassword(password: string, salt: string, expected: string) {
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

export function randomToken() { return crypto.randomBytes(32).toString('base64url'); }
export function sha256(value: string | Buffer) { return crypto.createHash('sha256').update(value).digest('hex'); }
