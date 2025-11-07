import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isValidHexColor } from '@/lib/theme';

export const dynamic = 'force-dynamic';

/**
 * GET /api/settings - Get company settings
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Get or create company settings
    let settings = await prisma.companySettings.findUnique({
      where: { companyId: user.companyId },
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.companySettings.create({
        data: {
          companyId: user.companyId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings - Update company settings
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'COMPANY_ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate colors if provided
    const colorFields = [
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'successColor',
      'warningColor',
      'errorColor',
      'sidebarBgColor',
      'sidebarTextColor',
      'headerBgColor',
      'headerTextColor',
    ];

    for (const field of colorFields) {
      if (body[field] && !isValidHexColor(body[field])) {
        return NextResponse.json(
          { success: false, error: `Geçersiz renk formatı: ${field}` },
          { status: 400 }
        );
      }
    }

    // Update or create settings
    const settings = await prisma.companySettings.upsert({
      where: { companyId: user.companyId },
      update: {
        ...body,
        // Don't allow updating logo/favicon URLs directly (use upload endpoints)
        logoUrl: undefined,
        faviconUrl: undefined,
      },
      create: {
        companyId: user.companyId,
        ...body,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Ayarlar güncellendi',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Ayarlar güncellenemedi' },
      { status: 500 }
    );
  }
}
