import { createHash } from 'node:crypto'

/**
 * Compute SHA-256 hash of a string
 */
export function computeHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}
