/**
 * Information about a file that needs to be restored
 */
export interface FileToRestore {
  /** Relative path from .centy folder */
  path: string
  /** Whether this file was previously tracked in the manifest */
  wasInManifest: boolean
}
