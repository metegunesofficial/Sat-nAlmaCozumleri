import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/request-metadata'

export const dynamic = 'force-dynamic'

/**
 * POST /api/demo/provision
 *
 * Create a demo tenant with sample data
 * No authentication required (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if demo provisioning is enabled
    const demoEnabled = process.env.ENABLE_DEMO_TENANTS !== 'false'

    if (!demoEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demo tenant provisioning is currently disabled',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, companyName } = body

    // Validation
    if (!email || !companyName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and company name are required',
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
        },
        { status: 400 }
      )
    }

    // Generate unique slug for demo company
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = `demo-${timestamp}-${randomSuffix}`

    // Hash default demo password
    const demoPassword = 'Demo123!@#'
    const hashedPassword = await hashPassword(demoPassword)

    // Create demo company with all related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Demo Company
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          isActive: true,
          isDemo: true,
          settings: {
            currency: 'TRY',
            timezone: 'Europe/Istanbul',
            fiscalYearStart: 1,
            language: 'tr',
          },
        },
      })

      // 2. Create Admin User
      const adminUser = await tx.user.create({
        data: {
          email,
          name: companyName + ' Admin',
          password: hashedPassword,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
          position: 'Demo Administrator',
        },
      })

      // 3. Create Departments
      const departments = await Promise.all([
        tx.department.create({
          data: {
            companyId: company.id,
            name: 'Bilgi Teknolojileri',
            code: 'IT',
            description: 'IT departmanı',
            monthlyBudget: 50000,
            yearlyBudget: 600000,
            isActive: true,
          },
        }),
        tx.department.create({
          data: {
            companyId: company.id,
            name: 'Satın Alma',
            code: 'PROC',
            description: 'Satın alma departmanı',
            monthlyBudget: 100000,
            yearlyBudget: 1200000,
            isActive: true,
          },
        }),
        tx.department.create({
          data: {
            companyId: company.id,
            name: 'Finans',
            code: 'FIN',
            description: 'Finans departmanı',
            monthlyBudget: 75000,
            yearlyBudget: 900000,
            isActive: true,
          },
        }),
      ])

      // 4. Create Product Categories
      const categories = await Promise.all([
        tx.category.create({
          data: {
            companyId: company.id,
            name: 'Ofis Malzemeleri',
            slug: 'ofis-malzemeleri-' + company.id,
            description: 'Kırtasiye ve ofis ekipmanları',
            isActive: true,
            order: 1,
          },
        }),
        tx.category.create({
          data: {
            companyId: company.id,
            name: 'Teknoloji',
            slug: 'teknoloji-' + company.id,
            description: 'Bilgisayar ve elektronik cihazlar',
            isActive: true,
            order: 2,
          },
        }),
        tx.category.create({
          data: {
            companyId: company.id,
            name: 'Mobilya',
            slug: 'mobilya-' + company.id,
            description: 'Ofis mobilyaları',
            isActive: true,
            order: 3,
          },
        }),
      ])

      // 5. Create Sample Products
      await Promise.all([
        tx.product.create({
          data: {
            companyId: company.id,
            categoryId: categories[0].id,
            name: 'A4 Kağıt (500 sayfa)',
            slug: 'a4-kagit-' + company.id,
            sku: 'OFF-A4-500-' + company.id,
            description: 'Standart A4 fotokopi kağıdı',
            price: 45.90,
            stock: 500,
            unit: 'paket',
            isActive: true,
          },
        }),
        tx.product.create({
          data: {
            companyId: company.id,
            categoryId: categories[1].id,
            name: 'Laptop Dell Latitude',
            slug: 'laptop-dell-' + company.id,
            sku: 'IT-DELL-LAT-' + company.id,
            description: 'Intel i5, 16GB RAM, 512GB SSD',
            price: 35000,
            stock: 10,
            unit: 'adet',
            isActive: true,
            isFeatured: true,
          },
        }),
        tx.product.create({
          data: {
            companyId: company.id,
            categoryId: categories[2].id,
            name: 'Ofis Sandalyesi',
            slug: 'ofis-sandalyesi-' + company.id,
            sku: 'FUR-CHAIR-' + company.id,
            description: 'Ergonomik ofis sandalyesi',
            price: 2500,
            stock: 25,
            unit: 'adet',
            isActive: true,
          },
        }),
      ])

      // 6. Create Purchase Categories (for procurement workflow)
      const purchaseCategories = await Promise.all([
        tx.purchaseCategory.create({
          data: {
            companyId: company.id,
            name: 'Düşük Değerli Alımlar',
            code: 'LOW',
            description: '0-5.000 TL arası alımlar',
            monthlyLimit: 50000,
            yearlyLimit: 600000,
            requiresApproval: true,
            minApprovalAmount: 0,
            isActive: true,
            order: 1,
          },
        }),
        tx.purchaseCategory.create({
          data: {
            companyId: company.id,
            name: 'Orta Değerli Alımlar',
            code: 'MED',
            description: '5.000-50.000 TL arası alımlar',
            monthlyLimit: 200000,
            yearlyLimit: 2400000,
            requiresApproval: true,
            minApprovalAmount: 5000,
            isActive: true,
            order: 2,
          },
        }),
      ])

      // 7. Create Approval Workflows
      await tx.approvalWorkflow.create({
        data: {
          companyId: company.id,
          name: 'Standart Onay',
          description: 'Departman müdürü onayı',
          isActive: true,
          minAmount: 0,
          maxAmount: 10000,
          departmentIds: departments.map(d => d.id),
          steps: {
            create: [
              {
                stepOrder: 0,
                stepName: 'Departman Müdürü Onayı',
                approverRole: 'DEPARTMENT_MANAGER',
                requiredAction: 'APPROVE',
              },
            ],
          },
        },
      })

      // 8. Create Company Budget
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      await tx.companyBudget.create({
        data: {
          companyId: company.id,
          year: currentYear,
          month: currentMonth,
          amount: 500000,
          spent: 0,
          reserved: 0,
          category: 'Genel',
        },
      })

      return {
        company,
        adminUser,
        departments,
        categories,
        purchaseCategories,
      }
    })

    // Log demo provision
    const metadata = getRequestMetadata(request)
    await audit.log({
      action: 'demo.provision',
      resource: `Company:${result.company.id}`,
      metadata: {
        companyName: result.company.name,
        email,
        slug: result.company.slug,
      },
      companyId: result.company.id,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
    })

    // Return success with credentials
    return NextResponse.json({
      success: true,
      data: {
        companyId: result.company.id,
        companyName: result.company.name,
        email,
        password: demoPassword,
        message: 'Demo tenant created successfully! You can now login with the provided credentials.',
      },
    })
  } catch (error: any) {
    console.error('Demo provision error:', error)

    // Check for unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'This email is already registered. Please use a different email.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create demo tenant. Please try again.',
      },
      { status: 500 }
    )
  }
}
