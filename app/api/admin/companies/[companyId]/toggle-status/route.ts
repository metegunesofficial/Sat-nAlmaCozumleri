import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHandler, ApiResponse } from '@/lib/api-handler'
import { requireRole } from '@/lib/authz'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/companies/[companyId]/toggle-status
 * Toggle company active status (SUPER_ADMIN only)
 */
export const POST = createHandler({
  permission: 'system:admin',
  handler: async (request, session, context: any) => {
    requireRole(session, ['SUPER_ADMIN'])

    const companyId = context.params.companyId

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return ApiResponse.notFound('Company')
    }

    const newStatus = !company.isActive

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: newStatus },
    })

    const action = newStatus ? 'company.activate' : 'company.deactivate'

    await audit.log({
      action,
      resource: `Company:${updated.id}`,
      metadata: {
        name: updated.name,
        previousStatus: company.isActive,
        newStatus: updated.isActive,
      },
      companyId: updated.id,
      actorUserId: session.user.id,
    })

    return ApiResponse.success(updated, {
      message: newStatus ? 'Company activated successfully' : 'Company deactivated successfully',
    })
  },
})
