import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { withCompanyScope } from '@/lib/authz'

export const dynamic = 'force-dynamic'

/**
 * GET /api/reports/suppliers
 * Supplier performance and activity report
 */
export const GET = createHandler({
  permission: 'report:read',
  rateLimit: 'heavy', // 10 requests per minute - reports are database-intensive
  handler: async (request, session) => {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all suppliers
    const suppliers = await prisma.supplier.findMany({
      where: withCompanyScope(session, {}),
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
      },
    })

    // Build date filter for request items
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    // Get supplier performance
    const supplierReport = await Promise.all(
      suppliers.map(async (supplier) => {
        // Get product IDs for this supplier
        const productIds = supplier.products.map((p) => p.id)

        // Get request items for these products
        const requestItems = await prisma.requestItem.findMany({
          where: {
            productId: { in: productIds },
            ...(Object.keys(dateFilter).length > 0 && {
              purchaseRequest: {
                createdAt: dateFilter,
                companyId: session.user.companyId,
              },
            }),
            ...(!Object.keys(dateFilter).length && {
              purchaseRequest: {
                companyId: session.user.companyId,
              },
            }),
          },
          include: {
            purchaseRequest: {
              select: {
                status: true,
                createdAt: true,
              },
            },
          },
        })

        const totalOrders = new Set(requestItems.map((item) => item.requestId)).size
        const totalValue = requestItems.reduce(
          (sum, item) => sum + (item.total?.toNumber() || 0),
          0
        )
        const totalQuantity = requestItems.reduce((sum, item) => sum + item.quantity, 0)

        const approvedOrders = requestItems.filter(
          (item) => item.purchaseRequest.status === 'APPROVED'
        ).length

        // Calculate average delivery time (placeholder - would need actual delivery dates)
        const avgDeliveryDays = 0 // Would calculate from actual delivery data

        // Most ordered products
        const productOrderCounts: Record<string, { count: number; value: number; name: string }> = {}
        requestItems.forEach((item) => {
          const product = supplier.products.find((p) => p.id === item.productId)
          if (product) {
            if (!productOrderCounts[item.productId]) {
              productOrderCounts[item.productId] = {
                count: 0,
                value: 0,
                name: product.name,
              }
            }
            productOrderCounts[item.productId].count += item.quantity
            productOrderCounts[item.productId].value += item.total?.toNumber() || 0
          }
        })

        const topProducts = Object.entries(productOrderCounts)
          .sort(([, a], [, b]) => b.value - a.value)
          .slice(0, 5)
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            orderCount: data.count,
            totalValue: data.value,
          }))

        return {
          supplierId: supplier.id,
          supplierName: supplier.name,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          rating: supplier.rating?.toNumber() || 0,
          status: supplier.status,
          productCount: supplier.products.length,
          totalOrders,
          totalValue,
          totalQuantity,
          approvedOrders,
          avgOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0,
          approvalRate: totalOrders > 0 ? ((approvedOrders / totalOrders) * 100).toFixed(1) : '0',
          avgDeliveryDays,
          topProducts,
          lastOrderDate: requestItems.length > 0
            ? requestItems.reduce((latest, item) =>
                item.purchaseRequest.createdAt > latest
                  ? item.purchaseRequest.createdAt
                  : latest,
              new Date(0)
            )
            : null,
        }
      })
    )

    // Sort by total value
    const sortedSuppliers = supplierReport.sort((a, b) => b.totalValue - a.totalValue)

    // Calculate summary
    const totalSpending = sortedSuppliers.reduce((sum, s) => sum + s.totalValue, 0)
    const totalOrders = sortedSuppliers.reduce((sum, s) => sum + s.totalOrders, 0)
    const activeSuppliers = sortedSuppliers.filter((s) => s.status === 'ACTIVE').length

    return ApiResponse.success({
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Now',
      },
      summary: {
        totalSuppliers: suppliers.length,
        activeSuppliers,
        inactiveSuppliers: suppliers.length - activeSuppliers,
        totalSpending,
        totalOrders,
        avgSpendingPerSupplier: suppliers.length > 0 ? totalSpending / suppliers.length : 0,
        avgOrdersPerSupplier: suppliers.length > 0 ? totalOrders / suppliers.length : 0,
        topSupplier: sortedSuppliers[0]?.supplierName || null,
        avgSupplierRating:
          suppliers.length > 0
            ? (
                suppliers.reduce((sum, s) => sum + (s.rating?.toNumber() || 0), 0) /
                suppliers.length
              ).toFixed(2)
            : '0',
      },
      suppliers: sortedSuppliers.map((s, index) => ({
        ...s,
        rank: index + 1,
        percentageShare: totalSpending > 0 ? ((s.totalValue / totalSpending) * 100).toFixed(2) : '0',
      })),
    })
  },
})
