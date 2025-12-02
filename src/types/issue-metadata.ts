/**
 * Metadata stored in each issue's metadata.json
 */
export interface IssueMetadata {
  /** Issue status (open, in-progress, closed, etc.) */
  status: string
  /** Priority level (low, medium, high) */
  priority: 'low' | 'medium' | 'high'
  /** ISO timestamp when issue was created */
  createdAt: string
  /** ISO timestamp when issue was last updated */
  updatedAt: string
  /** Custom fields defined in config */
  [key: string]: unknown
}
