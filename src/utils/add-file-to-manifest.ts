import type { CentyManifest } from '../types/centy-manifest.js'
import type { ManagedFile } from '../types/managed-file.js'

/**
 * Add a file to the manifest
 * Returns a new manifest with the file added
 */
export function addFileToManifest(
  manifest: CentyManifest,
  file: ManagedFile
): CentyManifest {
  return {
    ...manifest,
    updatedAt: new Date().toISOString(),
    managedFiles: [...manifest.managedFiles, file],
  }
}
