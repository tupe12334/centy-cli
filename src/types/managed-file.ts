/**
 * Represents a file or directory managed by centy
 */
export interface ManagedFile {
  /** Relative path from .centy folder */
  path: string
  /** SHA-256 hash of original content at creation/reset (empty string for directories) */
  hash: string
  /** Version of centy that created this file */
  version: string
  /** ISO timestamp when file was created/reset */
  createdAt: string
  /** Type of managed item */
  type: 'file' | 'directory'
}
