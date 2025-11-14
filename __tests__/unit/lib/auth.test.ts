import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'

describe('Authentication Functions', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      // bcrypt uses salt, so hashes should be different
      expect(hash1).not.toBe(hash2)
    })

    it('should hash empty string', async () => {
      const hashed = await hashPassword('')

      expect(hashed).toBeDefined()
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should hash long passwords', async () => {
      const longPassword = 'a'.repeat(100)
      const hashed = await hashPassword(longPassword)

      expect(hashed).toBeDefined()
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should hash passwords with special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hashed = await hashPassword(specialPassword)

      expect(hashed).toBeDefined()
      expect(hashed.length).toBeGreaterThan(0)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hashed)

      expect(isValid).toBe(false)
    })

    it('should reject empty password against valid hash', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword('', hashed)

      expect(isValid).toBe(false)
    })

    it('should handle case-sensitive password comparison', async () => {
      const password = 'TestPassword123'
      const hashed = await hashPassword(password)

      const isValidLower = await verifyPassword('testpassword123', hashed)
      const isValidUpper = await verifyPassword('TESTPASSWORD123', hashed)
      const isValidCorrect = await verifyPassword('TestPassword123', hashed)

      expect(isValidLower).toBe(false)
      expect(isValidUpper).toBe(false)
      expect(isValidCorrect).toBe(true)
    })

    it('should verify password with special characters', async () => {
      const password = 'P@ssw0rd!#$'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject password with slight variation', async () => {
      const password = 'testPassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword('testPassword124', hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    const testUserId = 'user123'
    const testEmail = 'test@example.com'
    const testRole = 'EMPLOYEE'

    it('should generate a valid JWT token', () => {
      const token = generateToken(testUserId, testEmail, testRole)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should include userId, email, and role in token payload', () => {
      const token = generateToken(testUserId, testEmail, testRole)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

      expect(decoded.userId).toBe(testUserId)
      expect(decoded.email).toBe(testEmail)
      expect(decoded.role).toBe(testRole)
    })

    it('should set 7-day expiration', () => {
      const token = generateToken(testUserId, testEmail, testRole)
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()

      // 7 days = 604800 seconds
      const expirationPeriod = decoded.exp - decoded.iat
      expect(expirationPeriod).toBe(604800)
    })

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1', 'user1@example.com', 'EMPLOYEE')
      const token2 = generateToken('user2', 'user2@example.com', 'EMPLOYEE')

      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens for different roles', () => {
      const token1 = generateToken(testUserId, testEmail, 'EMPLOYEE')
      const token2 = generateToken(testUserId, testEmail, 'COMPANY_ADMIN')

      expect(token1).not.toBe(token2)
    })

    it('should handle all user roles', () => {
      const roles = [
        'SUPER_ADMIN',
        'COMPANY_ADMIN',
        'EMPLOYEE',
        'DEPARTMENT_MANAGER',
        'FINANCE_MANAGER',
        'GENERAL_MANAGER',
        'PROCUREMENT_MANAGER',
      ]

      roles.forEach(role => {
        const token = generateToken(testUserId, testEmail, role)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

        expect(decoded.role).toBe(role)
      })
    })
  })

  describe('verifyToken', () => {
    const testUserId = 'user123'
    const testEmail = 'test@example.com'
    const testRole = 'EMPLOYEE'

    it('should verify valid token', () => {
      const token = generateToken(testUserId, testEmail, testRole)
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded).not.toBeNull()
      expect(decoded.userId).toBe(testUserId)
      expect(decoded.email).toBe(testEmail)
      expect(decoded.role).toBe(testRole)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = verifyToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should return null for tampered token', () => {
      const token = generateToken(testUserId, testEmail, testRole)
      // Tamper with the token by modifying a character
      const tamperedToken = token.slice(0, -5) + 'xxxxx'

      const decoded = verifyToken(tamperedToken)

      expect(decoded).toBeNull()
    })

    it('should return null for expired token', () => {
      // Generate a token with -1 second expiration (already expired)
      const expiredToken = jwt.sign(
        { userId: testUserId, email: testEmail, role: testRole },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      )

      const decoded = verifyToken(expiredToken)

      expect(decoded).toBeNull()
    })

    it('should return null for empty string', () => {
      const decoded = verifyToken('')

      expect(decoded).toBeNull()
    })

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token'
      const decoded = verifyToken(malformedToken)

      expect(decoded).toBeNull()
    })

    it('should return null for token with wrong secret', () => {
      // Generate token with different secret
      const wrongSecretToken = jwt.sign(
        { userId: testUserId, email: testEmail, role: testRole },
        'wrong-secret-key',
        { expiresIn: '7d' }
      )

      const decoded = verifyToken(wrongSecretToken)

      expect(decoded).toBeNull()
    })

    it('should verify token payload contains all expected fields', () => {
      const token = generateToken(testUserId, testEmail, testRole)
      const decoded = verifyToken(token)

      expect(decoded).toHaveProperty('userId')
      expect(decoded).toHaveProperty('email')
      expect(decoded).toHaveProperty('role')
      expect(decoded).toHaveProperty('iat')
      expect(decoded).toHaveProperty('exp')
    })
  })

  describe('Integration: Full authentication flow', () => {
    it('should complete full password hash and verify cycle', async () => {
      const originalPassword = 'SecurePassword123!'

      // Hash password
      const hashedPassword = await hashPassword(originalPassword)

      // Verify correct password
      const isValidCorrect = await verifyPassword(originalPassword, hashedPassword)
      expect(isValidCorrect).toBe(true)

      // Verify incorrect password
      const isValidIncorrect = await verifyPassword('WrongPassword', hashedPassword)
      expect(isValidIncorrect).toBe(false)
    })

    it('should complete full token generation and verification cycle', () => {
      const userId = 'user456'
      const email = 'user@example.com'
      const role = 'DEPARTMENT_MANAGER'

      // Generate token
      const token = generateToken(userId, email, role)

      // Verify token
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(userId)
      expect(decoded.email).toBe(email)
      expect(decoded.role).toBe(role)
    })

    it('should simulate login flow: password + token', async () => {
      const password = 'UserPassword123'
      const userId = 'user789'
      const email = 'login@example.com'
      const role = 'EMPLOYEE'

      // Step 1: Hash password (during registration)
      const hashedPassword = await hashPassword(password)

      // Step 2: Verify password (during login)
      const isPasswordValid = await verifyPassword(password, hashedPassword)
      expect(isPasswordValid).toBe(true)

      // Step 3: Generate token (after successful login)
      const token = generateToken(userId, email, role)

      // Step 4: Verify token (for authenticated requests)
      const decoded = verifyToken(token)
      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(userId)
      expect(decoded.email).toBe(email)
      expect(decoded.role).toBe(role)
    })
  })
})
