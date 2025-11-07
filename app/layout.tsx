import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateThemeCSS, getThemeSettings } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Satın Alma Platformu - Enterprise Procurement System',
  description: 'Çok aşamalı onay sistemi ile kurumsal satın alma platformu',
};

async function getCompanyTheme() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        companyId: true,
        company: {
          select: {
            name: true,
            logo: true,
            companySettings: true,
          },
        },
      },
    });

    if (!user?.company?.companySettings) {
      return null;
    }

    return {
      companyName: user.company.name,
      logo: user.company.logo,
      theme: getThemeSettings(user.company.companySettings),
    };
  } catch (error) {
    console.error('Failed to load company theme:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const companyTheme = await getCompanyTheme();

  return (
    <html lang="tr">
      <head>
        {/* Dynamic Favicon */}
        {companyTheme?.theme && (
          <style
            dangerouslySetInnerHTML={{
              __html: generateThemeCSS(companyTheme.theme),
            }}
          />
        )}
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
