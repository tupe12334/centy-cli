import type { CustomFieldDefinition } from './custom-field-definition.js'

/**
 * Issue configuration section
 */
export interface IssueConfig {
  /** Custom fields schema */
  customFields?: Record<string, CustomFieldDefinition>
  /** Default status for new issues */
  defaultStatus?: string
  /** Default priority for new issues */
  defaultPriority?: 'low' | 'medium' | 'high'
}
