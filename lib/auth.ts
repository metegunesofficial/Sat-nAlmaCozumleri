import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Ensure JWT_SECRET is defined - fail fast if not
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined')
}

const JWT_SECRET = process.env.JWT_SECRET

export interface JWTPayload {
  userId: string
  email: string
  role: string
  companyId?: string
  departmentId?: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
