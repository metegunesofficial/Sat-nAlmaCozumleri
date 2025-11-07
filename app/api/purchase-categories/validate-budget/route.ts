import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'

export const dynamic = 'force-dynamic'

/**
 * POST /api/purchase-categories/validate-budget
 * Validate if a purchase amount is within budget for a category
 */
export const POST = createHandler({
  permission: 'request:create',
  handler: async (request, session) => {
    const body = await request.json()
    const { purchaseCategoryId, amount } = body

    if (!purchaseCategoryId || !amount) {
      return ApiResponse.badRequest('Purchase category ID and amount are required')
    }

    // Get category with budget info
    const category = await prisma.purchaseCategory.findFirst({
      where: {
        id: purchaseCategoryId,
        companyId: session.user.companyId,
      },
    })

    if (!category) {
      return ApiResponse.notFound('Purchase category not found')
    }

    // Get current month usage
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const currentMonthRequests = await prisma.purchaseRequest.findMany({
      where: {
        purchaseCategoryId,
        companyId: session.user.companyId,
        createdAt: {
          gte: startOfMonth,
        },
        status: {
          in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'],
        },
      },
      select: {
        estimatedTotal: true,
      },
    })

    const monthlyUsed = currentMonthRequests.reduce(
      (sum, req) => sum + (req.estimatedTotal?.toNumber() || 0),
      0
    )

    // Get current year usage
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const currentYearRequests = await prisma.purchaseRequest.findMany({
      where: {
        purchaseCategoryId,
        companyId: session.user.companyId,
        createdAt: {
          gte: startOfYear,
        },
        status: {
          in: ['SUBMITTED', 'IN_REVIEW', 'APPROVED'],
        },
      },
      select: {
        estimatedTotal: true,
      },
    })

    const yearlyUsed = currentYearRequests.reduce(
      (sum, req) => sum + (req.estimatedTotal?.toNumber() || 0),
      0
    )

    const requestAmount = parseFloat(amount.toString())

    // Validation result
    const validation = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[],
      budgetInfo: {
        category: {
          name: category.name,
          code: category.code,
        },
        monthly: category.monthlyLimit
          ? {
              limit: category.monthlyLimit.toNumber(),
              used: monthlyUsed,
              remaining: category.monthlyLimit.toNumber() - monthlyUsed,
              afterRequest: category.monthlyLimit.toNumber() - monthlyUsed - requestAmount,
            }
          : null,
        yearly: category.yearlyLimit
          ? {
              limit: category.yearlyLimit.toNumber(),
              used: yearlyUsed,
              remaining: category.yearlyLimit.toNumber() - yearlyUsed,
              afterRequest: category.yearlyLimit.toNumber() - yearlyUsed - requestAmount,
            }
          : null,
        requiresApproval: category.requiresApproval,
        minApprovalAmount: category.minApprovalAmount?.toNumber() || 0,
      },
    }

    // Check monthly limit
    if (category.monthlyLimit) {
      const monthlyRemaining = category.monthlyLimit.toNumber() - monthlyUsed
      if (requestAmount > monthlyRemaining) {
        validation.isValid = false
        validation.errors.push(
          `Monthly budget exceeded. Remaining: ${monthlyRemaining.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          })}`
        )
      } else if (requestAmount > monthlyRemaining * 0.8) {
        // Warning if using more than 80% of remaining budget
        validation.warnings.push(
          `This request will use ${((requestAmount / monthlyRemaining) * 100).toFixed(
            1
          )}% of remaining monthly budget`
        )
      }
    }

    // Check yearly limit
    if (category.yearlyLimit) {
      const yearlyRemaining = category.yearlyLimit.toNumber() - yearlyUsed
      if (requestAmount > yearlyRemaining) {
        validation.isValid = false
        validation.errors.push(
          `Yearly budget exceeded. Remaining: ${yearlyRemaining.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          })}`
        )
      } else if (requestAmount > yearlyRemaining * 0.8) {
        validation.warnings.push(
          `This request will use ${((requestAmount / yearlyRemaining) * 100).toFixed(
            1
          )}% of remaining yearly budget`
        )
      }
    }

    // Check if approval is required
    if (
      category.requiresApproval &&
      category.minApprovalAmount &&
      requestAmount >= category.minApprovalAmount.toNumber()
    ) {
      validation.warnings.push(
        `This request exceeds the minimum approval amount (${category.minApprovalAmount.toNumber().toLocaleString(
          'tr-TR',
          { style: 'currency', currency: 'TRY' }
        )}) and will require approval`
      )
    }

    return ApiResponse.success(validation)
  },
})
