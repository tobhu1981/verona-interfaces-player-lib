// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

import { VeronaOperations, VeronaOperationId } from '../types/operations';
import { VeronaMessage } from '../types/messages';

/**
 * Validate if a string is a valid ISO 8601 date-time.
 * 
 * @advanced Use with caution - validation logic may change
 * @param dateString - String to validate
 * @returns true if valid ISO 8601 format
 * 
 * @example
 * ```typescript
 * if (isValidISODateTime(log.timeStamp)) {
 *   // Process log entry
 * }
 * ```
 */
export function isValidISODateTime(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Check if a string is a valid Verona operation ID.
 * 
 * @advanced Type guard for runtime validation
 * @param op - Unknown value to check
 * @returns true if valid operation ID
 * 
 */
export function isValidOperationId(op: unknown): op is VeronaOperationId {
  return typeof op === 'string' && 
         Object.values(VeronaOperations).includes(op as any);
}

/**
 * Check if data is a valid Verona message.
 * 
 * @advanced Type guard for runtime validation
 * @param data - Unknown value to check
 * @returns true if valid Verona message
 * 
 */
export function isVeronaMessage(data: unknown): data is VeronaMessage {
  return data !== null &&
         typeof data === 'object' &&
         'type' in data &&
         isValidOperationId((data as any).type);
}