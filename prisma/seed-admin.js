const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating SUPER_ADMIN user...')

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash('admin123456', 10)

  // System company oluştur
  const systemCompany = await prisma.company.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'System',
      slug: 'system',
      isActive: true
    }
  })

  // SUPER_ADMIN kullanıcısı oluştur
  const admin = await prisma.user.upsert({
    where: {
      email_companyId: {
        email: 'admin@system.com',
        companyId: systemCompany.id
      }
    },
    update: {},
    create: {
      email: 'admin@system.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: systemCompany.id,
      isActive: true
    }
  })

  console.log('✅ SUPER_ADMIN created!')
  console.log('\n📧 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email:    admin@system.com')
  console.log('Password: admin123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🚀 Now visit: /login')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
