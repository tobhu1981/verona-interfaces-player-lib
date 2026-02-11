// ============================================================================
// ENCODING UTILITIES
// ============================================================================

/**
 * Helper to encode data as base64.
 * Handles UTF-8 characters correctly.
 * 
 * @public
 * @param data - Object or string to encode
 * @returns Base64 encoded string
 * 
 */

export function encodeBase64(data: object | string): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

/**
 * Helper to decode base64 data.
 * Handles UTF-8 characters correctly.
 * 
 * @public
 * @param encoded - Base64 encoded string
 * @returns Decoded and parsed data
 * 
 */
export function decodeBase64<T = any>(encoded: string): T {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json);
}