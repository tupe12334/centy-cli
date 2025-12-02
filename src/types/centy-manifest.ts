import type { ManagedFile } from './managed-file.js'

/**
 * The manifest stored in .centy/.centy-manifest.json
 */
export interface CentyManifest {
  /** Manifest schema version for future migrations */
  schemaVersion: 1
  /** Version of centy that created the manifest */
  centyVersion: string
  /** ISO timestamp of manifest creation */
  createdAt: string
  /** ISO timestamp of last update */
  updatedAt: string
  /** List of files/directories managed by centy */
  managedFiles: ManagedFile[]
}
