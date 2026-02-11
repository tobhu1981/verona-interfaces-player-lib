// ============================================================================
// FACTORY UTILITIES
// ============================================================================

import { MainSchema } from '../types/schemas';
import { encodeBase64 } from './encoding';
import { MIN_SHARED_PARAMETER_KEY_LENGTH } from '../constants';

/**
 * Helper to create a log entry.
 * Automatically sets current timestamp.
 * 
 * @public
 * @param key - Log entry key/category
 * @param content - Optional log content (will be base64 encoded)
 * @returns Log entry object
 * 
 */
export function createLogEntry(key: string, content?: object | string): MainSchema.LogEntry {
  return {
    timeStamp: new Date().toISOString(),
    key,
    content: content ? encodeBase64(content) : undefined
  };
}

/**
 * Create a shared parameter.
 * Validates key length constraint.
 * 
 * @public
 * @param key - Parameter key (>= 2 characters)
 * @param value - Parameter value
 * @returns Shared parameter object
 * @throws Error if key is too short
 *
 */
export function createSharedParameter(key: string, value: string): MainSchema.SharedParameter {
  if (key.length < MIN_SHARED_PARAMETER_KEY_LENGTH) {
    throw new Error(`SharedParameter key must be at least ${MIN_SHARED_PARAMETER_KEY_LENGTH} characters`);
  }
  return { key, value };
}