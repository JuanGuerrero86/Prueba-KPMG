import fs from 'fs';
import jwt from 'jsonwebtoken';
import { env } from './env.config';

let privateKey: string;
let publicKey: string;

export function loadJwtKeys() {
  try {
    privateKey = fs.readFileSync(env.JWT.PRIVATE_KEY_PATH, 'utf-8');
    publicKey = fs.readFileSync(env.JWT.PUBLIC_KEY_PATH, 'utf-8');
  } catch {
    const secret = process.env.JWT_SECRET || 'dev-secret-key';
    privateKey = secret;
    publicKey = secret;
  }
}

export interface JwtPayload {
  sub: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  if (!privateKey) loadJwtKeys();
  const isRsa =
    privateKey.includes('BEGIN RSA PRIVATE KEY') || privateKey.includes('BEGIN PRIVATE KEY');
  return jwt.sign(payload, privateKey, {
    algorithm: isRsa ? 'RS256' : 'HS256',
    expiresIn: env.JWT.ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  if (!publicKey) loadJwtKeys();
  const isRsa =
    publicKey.includes('BEGIN PUBLIC KEY') || publicKey.includes('BEGIN RSA PUBLIC KEY');
  return jwt.verify(token, publicKey, {
    algorithms: [isRsa ? 'RS256' : 'HS256'],
  }) as JwtPayload;
}
