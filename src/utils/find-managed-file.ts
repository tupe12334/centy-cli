import type { CentyManifest } from '../types/centy-manifest.js'
import type { ManagedFile } from '../types/managed-file.js'

/**
 * Find a managed file in the manifest by path
 */
export function findManagedFile(
  manifest: CentyManifest,
  path: string
): ManagedFile | undefined {
  return manifest.managedFiles.find(f => f.path === path)
}
