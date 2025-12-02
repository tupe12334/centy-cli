/**
 * User's decisions about reconciliation
 */
export interface ReconciliationDecisions {
  /** Files to restore (user confirmed) */
  restore: string[]
  /** Files to reset (user confirmed) */
  reset: string[]
  /** Files to skip (user declined) */
  skip: string[]
}
