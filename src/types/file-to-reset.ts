/**
 * Information about a file that needs to be reset
 */
export interface FileToReset {
  /** Relative path from .centy folder */
  path: string
  /** Current hash of the file on disk */
  currentHash: string
  /** Original hash from manifest or template */
  originalHash: string
}
