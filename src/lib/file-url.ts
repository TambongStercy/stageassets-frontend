/**
 * Constructs the full URL for accessing uploaded files from the backend
 *
 * @param path - The file path returned by the API (e.g., "/uploads/event-logos/123.png", "uploads/avatars/456.jpg", or "https://lh3.googleusercontent.com/...")
 * @returns The complete URL to access the file
 *
 * @example
 * getFileUrl("/uploads/event-logos/123.png")
 * // => "http://localhost:3000/uploads/event-logos/123.png"
 *
 * @example
 * getFileUrl("https://lh3.googleusercontent.com/a/...")
 * // => "https://lh3.googleusercontent.com/a/..."
 */
export function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // If the path is already a full URL (http:// or https://), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Get the base API URL and remove /api suffix to get the server origin
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  // Remove leading slash if present (to avoid double slashes)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}
