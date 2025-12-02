import type { FileToRestore } from './file-to-restore.js'
import type { FileToReset } from './file-to-reset.js'

/**
 * Result of scanning the .centy folder
 */
export interface ReconciliationPlan {
  /** Files that need to be created (not in folder) */
  toCreate: string[]
  /** Files that are missing and user needs to confirm restore */
  toRestore: FileToRestore[]
  /** Files that are modified and user needs to confirm reset */
  toReset: FileToReset[]
  /** User-created files that will be left untouched */
  userFiles: string[]
  /** Files that are present and unmodified */
  upToDate: string[]
}
