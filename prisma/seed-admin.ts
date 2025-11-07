import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating SUPER_ADMIN user...')

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash('admin123456', 10)

  // SUPER_ADMIN kullanıcısı oluştur
  const admin = await prisma.user.upsert({
    where: {
      email_companyId: {
        email: 'admin@system.com',
        companyId: 'system'
      }
    },
    update: {},
    create: {
      email: 'admin@system.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: 'system', // Özel system company ID
      isActive: true,
      company: {
        connectOrCreate: {
          where: { id: 'system' },
          create: {
            id: 'system',
            name: 'System',
            slug: 'system',
            isActive: true
          }
        }
      }
    }
  })

  console.log('✅ SUPER_ADMIN created:', {
    email: admin.email,
    name: admin.name,
    role: admin.role
  })

  console.log('\n📧 Login credentials:')
  console.log('Email: admin@system.com')
  console.log('Password: admin123456')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
