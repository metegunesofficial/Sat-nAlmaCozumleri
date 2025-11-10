import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Seeding database...')

  // Check if platform company already exists
  let platformCompany = await prisma.company.findFirst({
    where: { slug: 'attelia-platform' },
  })

  if (!platformCompany) {
    console.log('📦 Creating platform company...')
    platformCompany = await prisma.company.create({
      data: {
        name: 'Attelia Platform',
        slug: 'attelia-platform',
        isActive: true,
      },
    })
    console.log('✅ Platform company created:', platformCompany.id)
  } else {
    console.log('✓ Platform company already exists')
  }

  // Check if SUPER_ADMIN user already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@atteliaplatform.com',
      role: 'SUPER_ADMIN'
    },
  })

  if (!existingSuperAdmin) {
    console.log('👤 Creating SUPER_ADMIN user...')

    // Hash password: "admin123456"
    const hashedPassword = await hashPassword('admin123456')

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@atteliaplatform.com',
        password: hashedPassword,
        name: 'Platform Admin',
        role: 'SUPER_ADMIN',
        companyId: platformCompany.id,
      },
    })

    console.log('✅ SUPER_ADMIN user created!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SUPER_ADMIN CREDENTIALS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    admin@atteliaplatform.com')
    console.log('🔑 Password: admin123456')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  IMPORTANT: Change password after first login!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
  } else {
    console.log('✓ SUPER_ADMIN user already exists')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 SUPER_ADMIN Email: admin@atteliaplatform.com')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
