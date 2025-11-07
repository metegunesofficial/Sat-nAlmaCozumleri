import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import {
  uploadCompanyFavicon,
  deleteCompanyFavicon,
} from '@/lib/blob';

export const dynamic = 'force-dynamic';

/**
 * POST /api/settings/favicon - Upload company favicon
 */
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Upload favicon
    const uploadResult = await uploadCompanyFavicon(file, user.companyId);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 400 }
      );
    }

    // Get current settings
    const currentSettings = await prisma.companySettings.findUnique({
      where: { companyId: user.companyId },
    });

    // Delete old favicon if exists
    if (currentSettings?.faviconUrl) {
      await deleteCompanyFavicon(currentSettings.faviconUrl);
    }

    // Update settings with new favicon URL
    const settings = await prisma.companySettings.upsert({
      where: { companyId: user.companyId },
      update: {
        faviconUrl: uploadResult.url,
      },
      create: {
        companyId: user.companyId,
        faviconUrl: uploadResult.url,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Favicon yüklendi',
    });
  } catch (error) {
    console.error('Upload favicon error:', error);
    return NextResponse.json(
      { success: false, error: 'Favicon yüklenemedi' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/favicon - Delete company favicon
 */
export async function DELETE(request: NextRequest) {
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

    const settings = await prisma.companySettings.findUnique({
      where: { companyId: user.companyId },
    });

    if (!settings?.faviconUrl) {
      return NextResponse.json(
        { success: false, error: 'Favicon bulunamadı' },
        { status: 404 }
      );
    }

    // Delete from blob storage
    await deleteCompanyFavicon(settings.faviconUrl);

    // Update settings
    const updated = await prisma.companySettings.update({
      where: { companyId: user.companyId },
      data: {
        faviconUrl: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Favicon silindi',
    });
  } catch (error) {
    console.error('Delete favicon error:', error);
    return NextResponse.json(
      { success: false, error: 'Favicon silinemedi' },
      { status: 500 }
    );
  }
}
