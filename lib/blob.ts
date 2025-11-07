/**
 * Vercel Blob Storage Utilities
 * For uploading company logos, favicons, and other assets
 */

import { put, del, list } from '@vercel/blob';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload company logo
 */
export async function uploadCompanyLogo(
  file: File,
  companyId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `logos/${companyId}/logo.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false, // Use fixed name so it replaces old logo
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Failed to upload logo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload company favicon
 */
export async function uploadCompanyFavicon(
  file: File,
  companyId: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `favicons/${companyId}/favicon.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Failed to upload favicon:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete company logo
 */
export async function deleteCompanyLogo(logoUrl: string): Promise<boolean> {
  try {
    await del(logoUrl);
    return true;
  } catch (error) {
    console.error('Failed to delete logo:', error);
    return false;
  }
}

/**
 * Delete company favicon
 */
export async function deleteCompanyFavicon(faviconUrl: string): Promise<boolean> {
  try {
    await del(faviconUrl);
    return true;
  } catch (error) {
    console.error('Failed to delete favicon:', error);
    return false;
  }
}

/**
 * List all company assets
 */
export async function listCompanyAssets(companyId: string) {
  try {
    const { blobs } = await list({
      prefix: `logos/${companyId}/`,
    });
    return blobs;
  } catch (error) {
    console.error('Failed to list assets:', error);
    return [];
  }
}

/**
 * Convert File to base64 (for preview)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
