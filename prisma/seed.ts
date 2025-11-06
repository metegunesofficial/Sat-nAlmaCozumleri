import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Production database setup started...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Check if database is already seeded
  const existingCompany = await prisma.company.findFirst()
  if (existingCompany) {
    console.log('\n⚠️  Database already has data. Skipping seed.')
    console.log('   To reseed, first run: npx prisma migrate reset')
    return
  }

  console.log('\n🏢 Creating initial company...')

  const company = await prisma.company.create({
    data: {
      name: 'Attelia Dental',
      slug: 'attelia-dental',
      taxNumber: null, // Will be set later
      address: null,
      city: null,
      phone: null,
      email: 'info@attelia.com',
      website: null,
      isActive: true,
      settings: {
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        fiscalYearStart: 1,
      }
    }
  })

  console.log(`✅ Company created: ${company.name}`)

  console.log('\n👤 Creating super admin user...')

  // Generate a secure password hash
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@attelia.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: company.id,
      phone: null,
      position: 'System Admin'
    }
  })

  console.log(`✅ Super admin created: ${superAdmin.email}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ Production database setup completed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 Initial Login Credentials:')
  console.log('   Email:    admin@attelia.com')
  console.log('   Password: admin123')
  console.log('\n⚠️  IMPORTANT: Please change this password immediately after first login!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('\n❌ Database setup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
