import { getServerSession as getNextAuthServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import type { Session } from 'next-auth'

export async function getServerSession(): Promise<Session | null> {
  return await getNextAuthServerSession(authOptions)
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function requireRole(allowedRoles: string[]): Promise<Session> {
  const session = await requireAuth()

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return session
}
