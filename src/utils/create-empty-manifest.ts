import type { CentyManifest } from '../types/centy-manifest.js'

/**
 * Create an empty manifest
 */
export function createEmptyManifest(centyVersion: string): CentyManifest {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    centyVersion,
    createdAt: now,
    updatedAt: now,
    managedFiles: [],
  }
}
