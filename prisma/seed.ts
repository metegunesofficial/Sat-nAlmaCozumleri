import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding multi-tenant database...')

  // Create Companies
  console.log('\n📦 Creating companies...')

  const company1 = await prisma.company.upsert({
    where: { slug: 'attelia-merkez' },
    update: {},
    create: {
      name: 'Attelia Dental Merkez',
      slug: 'attelia-merkez',
      taxNumber: '1234567890',
      address: 'Merkez Mahallesi, Dental Cad. No:1',
      city: 'Ankara',
      phone: '+90 312 123 45 67',
      email: 'merkez@attelia.com',
      website: 'https://attelia.com',
      isActive: true,
      settings: {
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        fiscalYearStart: 1,
      }
    }
  })

  const company2 = await prisma.company.upsert({
    where: { slug: 'attelia-istanbul' },
    update: {},
    create: {
      name: 'Attelia Dental İstanbul',
      slug: 'attelia-istanbul',
      taxNumber: '0987654321',
      address: 'İstanbul Mahallesi, Sağlık Sok. No:15',
      city: 'İstanbul',
      phone: '+90 212 987 65 43',
      email: 'istanbul@attelia.com',
      website: 'https://attelia.com/istanbul',
      isActive: true,
      settings: {
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        fiscalYearStart: 1,
      }
    }
  })

  console.log(`✅ Companies created: ${company1.name}, ${company2.name}`)

  // Create Users for Company 1
  console.log('\n👥 Creating users for', company1.name)

  const hashedPassword = await bcrypt.hash('password123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email_companyId: { email: 'superadmin@attelia.com', companyId: company1.id } },
    update: {},
    create: {
      email: 'superadmin@attelia.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: company1.id,
      phone: '+90 555 000 00 01'
    }
  })

  const companyAdmin = await prisma.user.upsert({
    where: { email_companyId: { email: 'admin@attelia.com', companyId: company1.id } },
    update: {},
    create: {
      email: 'admin@attelia.com',
      name: 'Ahmet Yıldırım',
      password: hashedPassword,
      role: 'COMPANY_ADMIN',
      companyId: company1.id,
      phone: '+90 555 111 11 11',
      position: 'Genel Müdür'
    }
  })

  console.log(`✅ Admin users created`)

  // Create Departments for Company 1
  console.log('\n🏢 Creating departments for', company1.name)

  const itDept = await prisma.department.create({
    data: {
      companyId: company1.id,
      name: 'Bilgi İşlem',
      code: 'IT',
      description: 'Bilgi teknolojileri departmanı',
      monthlyBudget: 50000,
      yearlyBudget: 600000,
      isActive: true
    }
  })

  const procurementDept = await prisma.department.create({
    data: {
      companyId: company1.id,
      name: 'Satın Alma',
      code: 'PROC',
      description: 'Satın alma ve tedarik departmanı',
      monthlyBudget: 200000,
      yearlyBudget: 2400000,
      isActive: true
    }
  })

  const hrDept = await prisma.department.create({
    data: {
      companyId: company1.id,
      name: 'İnsan Kaynakları',
      code: 'HR',
      description: 'İnsan kaynakları departmanı',
      monthlyBudget: 30000,
      yearlyBudget: 360000,
      isActive: true
    }
  })

  const financeDept = await prisma.department.create({
    data: {
      companyId: company1.id,
      name: 'Finans',
      code: 'FIN',
      description: 'Finans ve muhasebe departmanı',
      monthlyBudget: 100000,
      yearlyBudget: 1200000,
      isActive: true
    }
  })

  console.log(`✅ Departments created: IT, PROC, HR, FIN`)

  // Create Department Managers
  const itManager = await prisma.user.create({
    data: {
      email: 'it.manager@attelia.com',
      name: 'Mehmet Demir',
      password: hashedPassword,
      role: 'DEPARTMENT_MANAGER',
      companyId: company1.id,
      departmentId: itDept.id,
      position: 'IT Müdürü',
      employeeId: 'EMP001',
      phone: '+90 555 222 22 22'
    }
  })

  const procManager = await prisma.user.create({
    data: {
      email: 'procurement@attelia.com',
      name: 'Ayşe Kaya',
      password: hashedPassword,
      role: 'PROCUREMENT_MANAGER',
      companyId: company1.id,
      departmentId: procurementDept.id,
      position: 'Satın Alma Müdürü',
      employeeId: 'EMP002',
      phone: '+90 555 333 33 33'
    }
  })

  const financeManager = await prisma.user.create({
    data: {
      email: 'finance@attelia.com',
      name: 'Can Öztürk',
      password: hashedPassword,
      role: 'FINANCE_MANAGER',
      companyId: company1.id,
      departmentId: financeDept.id,
      position: 'Finans Müdürü',
      employeeId: 'EMP003',
      phone: '+90 555 444 44 44'
    }
  })

  // Update departments with managers
  await prisma.department.update({
    where: { id: itDept.id },
    data: { managerId: itManager.id }
  })

  await prisma.department.update({
    where: { id: procurementDept.id },
    data: { managerId: procManager.id }
  })

  await prisma.department.update({
    where: { id: financeDept.id },
    data: { managerId: financeManager.id }
  })

  // Create regular employees
  const employee1 = await prisma.user.create({
    data: {
      email: 'john.doe@attelia.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company1.id,
      departmentId: itDept.id,
      position: 'Yazılım Geliştirici',
      employeeId: 'EMP004',
      phone: '+90 555 555 55 55'
    }
  })

  const employee2 = await prisma.user.create({
    data: {
      email: 'jane.smith@attelia.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company1.id,
      departmentId: hrDept.id,
      position: 'İK Uzmanı',
      employeeId: 'EMP005',
      phone: '+90 555 666 66 66'
    }
  })

  console.log(`✅ Users created with managers`)

  // Create Budgets
  console.log('\n💰 Creating budgets...')

  const currentYear = new Date().getFullYear()

  await prisma.budget.create({
    data: {
      departmentId: itDept.id,
      year: currentYear,
      month: new Date().getMonth() + 1,
      amount: 50000,
      spent: 15000,
      reserved: 10000
    }
  })

  await prisma.budget.create({
    data: {
      departmentId: procurementDept.id,
      year: currentYear,
      month: new Date().getMonth() + 1,
      amount: 200000,
      spent: 75000,
      reserved: 50000
    }
  })

  console.log(`✅ Budgets created`)

  // Create Categories
  console.log('\n📂 Creating categories for', company1.name)

  const categories = [
    {
      companyId: company1.id,
      name: 'Ofis Malzemeleri',
      slug: 'ofis-malzemeleri',
      description: 'Kırtasiye, yazıcı, vs.',
      order: 1
    },
    {
      companyId: company1.id,
      name: 'Bilgisayar ve Donanım',
      slug: 'bilgisayar-donanim',
      description: 'Laptop, masaüstü, monitor',
      order: 2
    },
    {
      companyId: company1.id,
      name: 'Dental Malzemeler',
      slug: 'dental-malzemeler',
      description: 'Dental ürünler ve ekipmanlar',
      order: 3
    },
    {
      companyId: company1.id,
      name: 'Temizlik Malzemeleri',
      slug: 'temizlik-malzemeleri',
      description: 'Hijyen ve temizlik ürünleri',
      order: 4
    }
  ]

  const createdCategories = await Promise.all(
    categories.map(cat => prisma.category.create({ data: cat }))
  )

  console.log(`✅ Categories created`)

  // Create Products
  console.log('\n📦 Creating products for', company1.name)

  const products = [
    {
      companyId: company1.id,
      categoryId: createdCategories[0].id,
      name: 'A4 Kağıt (500 sayfa)',
      slug: 'a4-kagit-500',
      sku: 'OFF-A4-500',
      description: 'Standart A4 fotokopi kağıdı',
      price: 45.90,
      stock: 500,
      unit: 'paket',
      isActive: true
    },
    {
      companyId: company1.id,
      categoryId: createdCategories[1].id,
      name: 'Dell Latitude 5430 Laptop',
      slug: 'dell-latitude-5430',
      sku: 'IT-DELL-5430',
      description: 'Intel i5, 16GB RAM, 512GB SSD',
      price: 35000,
      wholesalePrice: 32000,
      stock: 10,
      unit: 'adet',
      isActive: true,
      isFeatured: true
    },
    {
      companyId: company1.id,
      categoryId: createdCategories[1].id,
      name: 'LG 27" Monitor',
      slug: 'lg-27-monitor',
      sku: 'IT-LG-27',
      description: 'Full HD IPS panel',
      price: 4500,
      stock: 25,
      unit: 'adet',
      isActive: true
    },
    {
      companyId: company1.id,
      categoryId: createdCategories[2].id,
      name: 'Dental Eldiven (100lü)',
      slug: 'dental-eldiven-100',
      sku: 'DEN-GLOVE-100',
      description: 'Lateks dental eldiven',
      price: 125,
      wholesalePrice: 110,
      minOrderQty: 10,
      stock: 1000,
      unit: 'kutu',
      isActive: true
    }
  ]

  await Promise.all(
    products.map(prod => prisma.product.create({ data: prod }))
  )

  console.log(`✅ Products created`)

  // Create Approval Workflows
  console.log('\n⚙️ Creating approval workflows for', company1.name)

  // Workflow 1: 0-10,000 TL
  const workflow1 = await prisma.approvalWorkflow.create({
    data: {
      companyId: company1.id,
      name: 'Standart Onay (0-10K TL)',
      description: 'Departman müdürü onayı yeterli',
      isActive: true,
      minAmount: 0,
      maxAmount: 10000,
      departmentIds: [itDept.id, hrDept.id, procurementDept.id, financeDept.id],
      steps: {
        create: [
          {
            stepOrder: 0,
            stepName: 'Departman Müdürü Onayı',
            approverRole: 'DEPARTMENT_MANAGER',
            requiredAction: 'APPROVE',
            isOptional: false
          }
        ]
      }
    }
  })

  // Workflow 2: 10,000-50,000 TL
  const workflow2 = await prisma.approvalWorkflow.create({
    data: {
      companyId: company1.id,
      name: 'İki Aşamalı Onay (10K-50K TL)',
      description: 'Departman müdürü + Satın Alma müdürü',
      isActive: true,
      minAmount: 10000,
      maxAmount: 50000,
      departmentIds: [itDept.id, hrDept.id, procurementDept.id, financeDept.id],
      steps: {
        create: [
          {
            stepOrder: 0,
            stepName: 'Departman Müdürü Onayı',
            approverRole: 'DEPARTMENT_MANAGER',
            requiredAction: 'APPROVE'
          },
          {
            stepOrder: 1,
            stepName: 'Satın Alma Müdürü Onayı',
            approverRole: 'PROCUREMENT_MANAGER',
            requiredAction: 'APPROVE'
          }
        ]
      }
    }
  })

  // Workflow 3: 50,000+ TL
  const workflow3 = await prisma.approvalWorkflow.create({
    data: {
      companyId: company1.id,
      name: 'Üç Aşamalı Onay (50K+ TL)',
      description: 'Departman + Satın Alma + Finans müdürü',
      isActive: true,
      minAmount: 50000,
      maxAmount: null,
      departmentIds: [itDept.id, hrDept.id, procurementDept.id, financeDept.id],
      steps: {
        create: [
          {
            stepOrder: 0,
            stepName: 'Departman Müdürü Onayı',
            approverRole: 'DEPARTMENT_MANAGER',
            requiredAction: 'APPROVE'
          },
          {
            stepOrder: 1,
            stepName: 'Satın Alma Müdürü Onayı',
            approverRole: 'PROCUREMENT_MANAGER',
            requiredAction: 'APPROVE'
          },
          {
            stepOrder: 2,
            stepName: 'Finans Müdürü Onayı',
            approverRole: 'FINANCE_MANAGER',
            requiredAction: 'APPROVE'
          }
        ]
      }
    }
  })

  console.log(`✅ Workflows created: 3 approval workflows`)

  // Create sample purchase requests
  console.log('\n📝 Creating sample purchase requests...')

  const pr1 = await prisma.purchaseRequest.create({
    data: {
      companyId: company1.id,
      requestNumber: `PR${currentYear}${String(new Date().getMonth() + 1).padStart(2, '0')}0001`,
      requesterId: employee1.id,
      departmentId: itDept.id,
      title: 'Yeni Laptop Talebi',
      description: 'Yazılım geliştirme için güçlü laptop',
      priority: 'HIGH',
      status: 'SUBMITTED',
      estimatedTotal: 35000,
      workflowId: workflow2.id,
      items: {
        create: [
          {
            productName: 'Dell Latitude 5430 Laptop',
            productSku: 'IT-DELL-5430',
            quantity: 1,
            unitPrice: 35000,
            totalPrice: 35000
          }
        ]
      }
    }
  })

  const pr2 = await prisma.purchaseRequest.create({
    data: {
      companyId: company1.id,
      requestNumber: `PR${currentYear}${String(new Date().getMonth() + 1).padStart(2, '0')}0002`,
      requesterId: employee2.id,
      departmentId: hrDept.id,
      title: 'Ofis Malzemeleri',
      description: 'Aylık ofis malzeme ihtiyacı',
      priority: 'NORMAL',
      status: 'DRAFT',
      estimatedTotal: 500,
      workflowId: workflow1.id,
      items: {
        create: [
          {
            productName: 'A4 Kağıt (500 sayfa)',
            productSku: 'OFF-A4-500',
            quantity: 10,
            unitPrice: 45.90,
            totalPrice: 459
          }
        ]
      }
    }
  })

  console.log(`✅ Sample purchase requests created`)

  // Create Company 2 minimal data
  console.log('\n📦 Creating minimal data for', company2.name)

  const company2Admin = await prisma.user.create({
    data: {
      email: 'admin@attelia-istanbul.com',
      name: 'Zeynep Yılmaz',
      password: hashedPassword,
      role: 'COMPANY_ADMIN',
      companyId: company2.id,
      phone: '+90 555 777 77 77',
      position: 'Şube Müdürü'
    }
  })

  const company2Dept = await prisma.department.create({
    data: {
      companyId: company2.id,
      name: 'Genel',
      code: 'GEN',
      description: 'Genel departman',
      monthlyBudget: 100000,
      yearlyBudget: 1200000,
      isActive: true
    }
  })

  console.log(`✅ Company 2 basic setup completed`)

  console.log('\n🎉 Multi-tenant seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n${company1.name}:`)
  console.log('  Super Admin: superadmin@attelia.com / password123')
  console.log('  Company Admin: admin@attelia.com / password123')
  console.log('  IT Manager: it.manager@attelia.com / password123')
  console.log('  Procurement Manager: procurement@attelia.com / password123')
  console.log('  Finance Manager: finance@attelia.com / password123')
  console.log('  Employee (IT): john.doe@attelia.com / password123')
  console.log('  Employee (HR): jane.smith@attelia.com / password123')
  console.log(`\n${company2.name}:`)
  console.log('  Company Admin: admin@attelia-istanbul.com / password123')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
