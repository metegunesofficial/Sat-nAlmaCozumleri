import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      companyId: string
      companyName?: string
      departmentId?: string
      departmentName?: string
      position?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string
    companyName?: string
    departmentId?: string
    departmentName?: string
    position?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string
    companyName?: string
    departmentId?: string
    departmentName?: string
    position?: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gerekli')
        }

        try {
          // Find user with company and department info
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })

          if (!user) {
            throw new Error('Kullanıcı bulunamadı')
          }

          // Check if company is active
          if (!user.company.isActive) {
            throw new Error('Şirket hesabı aktif değil')
          }

          // Verify password
          const isValid = await verifyPassword(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Geçersiz şifre')
          }

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: user.company.name,
            departmentId: user.departmentId || undefined,
            departmentName: user.department?.name || undefined,
            position: user.position || undefined,
          }
        } catch (error: any) {
          console.error('Auth error:', error)
          throw new Error(error.message || 'Giriş başarısız')
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.departmentId = user.departmentId
        token.departmentName = user.departmentName
        token.position = user.position
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.companyId = token.companyId
        session.user.companyName = token.companyName
        session.user.departmentId = token.departmentName
        session.user.departmentName = token.departmentName
        session.user.position = token.position
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
