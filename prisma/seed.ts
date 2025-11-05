import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User
  const hashedAdminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@attelia.com' },
    update: {},
    create: {
      email: 'admin@attelia.com',
      name: 'Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      phone: '+90 555 123 45 67',
      companyName: 'Attelia Admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create Test Customer
  const hashedCustomerPassword = await bcrypt.hash('test123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Müşteri',
      password: hashedCustomerPassword,
      role: 'CUSTOMER',
      phone: '+90 555 987 65 43',
    },
  })
  console.log('✅ Customer user created:', customer.email)

  // Create Categories
  const categories = [
    {
      name: 'Diş Fırçaları',
      slug: 'dis-fircalari',
      description: 'Manuel ve elektrikli diş fırçaları',
      order: 1,
    },
    {
      name: 'Diş Macunları',
      slug: 'dis-macunlari',
      description: 'Çeşitli diş macunu seçenekleri',
      order: 2,
    },
    {
      name: 'Ağız Suları',
      slug: 'agiz-sulari',
      description: 'Antiseptik ve beyazlatıcı ağız suları',
      order: 3,
    },
    {
      name: 'Diş İplikleri',
      slug: 'dis-iplikleri',
      description: 'Dental floss ve diş ipleri',
      order: 4,
    },
    {
      name: 'Protezler',
      slug: 'protezler',
      description: 'Diş protezleri ve bakım ürünleri',
      order: 5,
    },
    {
      name: 'İmplantlar',
      slug: 'implantlar',
      description: 'Dental implant sistemleri',
      order: 6,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
  console.log('✅ Categories created')

  // Create Sample Products
  const disfiracalari = await prisma.category.findUnique({ where: { slug: 'dis-fircalari' } })
  const dismacunlari = await prisma.category.findUnique({ where: { slug: 'dis-macunlari' } })
  const agizsulari = await prisma.category.findUnique({ where: { slug: 'agiz-sulari' } })

  if (disfiracalari && dismacunlari && agizsulari) {
    const products = [
      {
        name: 'Oral-B Elektrikli Diş Fırçası Pro 3',
        slug: 'oral-b-elektrikli-dis-fircasi-pro-3',
        description: 'Profesyonel temizlik için 3D temizleme teknolojisi ile donatılmış elektrikli diş fırçası. Diş etlerinizi korurken dişlerinizi nazikçe temizler.',
        shortDesc: '3D temizleme teknolojisi, basınç sensörü ve 3 temizlik modu',
        sku: 'OB-PRO3-001',
        barcode: '8001090123456',
        price: 899.99,
        discountPrice: 699.99,
        wholesalePrice: 599.99,
        minOrderQty: 1,
        stock: 50,
        unit: 'adet',
        categoryId: disfiracalari.id,
        brand: 'Oral-B',
        manufacturer: 'Braun',
        tags: ['elektrikli', 'şarjlı', 'profesyonel'],
        isActive: true,
        isFeatured: true,
        isNew: true,
        rating: 4.8,
        images: [],
      },
      {
        name: 'Colgate Total Profesyonel Diş Macunu 75ml',
        slug: 'colgate-total-profesyonel-dis-macunu-75ml',
        description: '12 saate kadar koruma sağlayan profesyonel diş macunu. Diş çürüklerine, diş eti sorunlarına ve diş taşına karşı etkili.',
        shortDesc: '12 saate kadar koruma, diş eti sağlığı',
        sku: 'CG-TOTAL-75',
        barcode: '8714789123456',
        price: 45.90,
        discountPrice: 35.90,
        wholesalePrice: 28.90,
        minOrderQty: 12,
        stock: 500,
        unit: 'adet',
        categoryId: dismacunlari.id,
        brand: 'Colgate',
        manufacturer: 'Colgate-Palmolive',
        tags: ['beyazlatıcı', 'koruma', 'diş eti'],
        isActive: true,
        isFeatured: true,
        isNew: false,
        rating: 4.5,
        images: [],
      },
      {
        name: 'Sensodyne Hassas Diş Macunu 100ml',
        slug: 'sensodyne-hassas-dis-macunu-100ml',
        description: 'Hassas dişler için özel formül. Günlük kullanımla hassasiyeti azaltır ve diş minesi güçlendirir.',
        shortDesc: 'Hassas dişler için, flor içerikli',
        sku: 'SS-HAS-100',
        barcode: '5012345123456',
        price: 52.90,
        discountPrice: 42.90,
        wholesalePrice: 35.90,
        minOrderQty: 12,
        stock: 300,
        unit: 'adet',
        categoryId: dismacunlari.id,
        brand: 'Sensodyne',
        manufacturer: 'GlaxoSmithKline',
        tags: ['hassas', 'koruma', 'flor'],
        isActive: true,
        isFeatured: false,
        isNew: false,
        rating: 4.7,
        images: [],
      },
      {
        name: 'Listerine Cool Mint Ağız Çalkalama Suyu 500ml',
        slug: 'listerine-cool-mint-agiz-calkalama-suyu-500ml',
        description: 'Güçlü antiseptik formülü ile ağız bakımınızı tamamlar. Bakterileri yok eder ve taze nefes sağlar.',
        shortDesc: 'Antiseptik, nane aromalı, 500ml',
        sku: 'LS-MINT-500',
        barcode: '3574661123456',
        price: 69.90,
        discountPrice: 54.90,
        wholesalePrice: 45.90,
        minOrderQty: 12,
        stock: 200,
        unit: 'adet',
        categoryId: agizsulari.id,
        brand: 'Listerine',
        manufacturer: 'Johnson & Johnson',
        tags: ['antiseptik', 'nane', 'taze nefes'],
        isActive: true,
        isFeatured: true,
        isNew: false,
        rating: 4.6,
        images: [],
      },
      {
        name: 'Manuel Diş Fırçası Yumuşak Kıl',
        slug: 'manuel-dis-fircasi-yumusak-kil',
        description: 'Hassas diş etleri için yumuşak kıllı manuel diş fırçası. Ergonomik tutamağı ile rahat kullanım.',
        shortDesc: 'Yumuşak kıl, ergonomik tasarım',
        sku: 'MDF-SOFT-001',
        barcode: '8680123456789',
        price: 18.90,
        discountPrice: null,
        wholesalePrice: 12.90,
        minOrderQty: 24,
        stock: 1000,
        unit: 'adet',
        categoryId: disfiracalari.id,
        brand: 'Generic',
        manufacturer: 'Türkiye',
        tags: ['manuel', 'yumuşak', 'ekonomik'],
        isActive: true,
        isFeatured: false,
        isNew: false,
        rating: 4.2,
        images: [],
      },
    ]

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
    }
    console.log('✅ Sample products created')
  }

  // Create Settings
  const settings = [
    { key: 'site_name', value: 'Attelia Dental', type: 'text', group: 'general' },
    { key: 'site_description', value: 'Ağız ve Diş Sağlığı Ürünleri', type: 'text', group: 'general' },
    { key: 'site_email', value: 'info@attelia.com', type: 'email', group: 'general' },
    { key: 'site_phone', value: '+90 555 123 45 67', type: 'text', group: 'general' },
    { key: 'free_shipping_limit', value: '500', type: 'number', group: 'shipping' },
    { key: 'tax_rate', value: '0.18', type: 'number', group: 'pricing' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Settings created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
