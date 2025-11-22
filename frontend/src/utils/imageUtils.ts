/**
 * Utility functions for handling product images
 * Images are now fetched as signed URLs from the backend
 */

/**
 * Get product image URL (already a signed URL from backend)
 * @param imageUrl - The signed image URL from the backend
 * @returns The image URL or null if not provided
 */
export const getProductImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl) {
    return null;
  }
  return imageUrl;
};
