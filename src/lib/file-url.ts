/**
 * Constructs the full URL for accessing uploaded files from the backend
 *
 * @param path - The file path returned by the API (e.g., "/uploads/event-logos/123.png" or "uploads/avatars/456.jpg")
 * @returns The complete URL to access the file
 *
 * @example
 * getFileUrl("/uploads/event-logos/123.png")
 * // => "http://localhost:3000/uploads/event-logos/123.png"
 */
export function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // Get the base API URL and remove /api suffix to get the server origin
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '');

  // Remove leading slash if present (to avoid double slashes)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}
