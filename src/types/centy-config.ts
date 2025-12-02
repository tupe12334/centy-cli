import type { IssueConfig } from './issue-config.js'

/**
 * Main centy configuration stored in .centy/config.json
 */
export interface CentyConfig {
  /** Issue configuration */
  issues?: IssueConfig
}
