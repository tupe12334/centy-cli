import type { CentyConfig } from '../../types/centy-config.js'
import type { CustomFieldDefinition } from '../../types/custom-field-definition.js'

interface ConfigDefaults {
  defaultStatus: string
  defaultPriority: 'low' | 'medium' | 'high'
  customFields: Record<string, CustomFieldDefinition> | undefined
}

/**
 * Extract default values from config, falling back to standard defaults
 */
export function getConfigDefaults(config: CentyConfig | null): ConfigDefaults {
  if (config === null || config.issues === undefined) {
    return {
      defaultStatus: 'open',
      defaultPriority: 'medium',
      customFields: undefined,
    }
  }

  const issues = config.issues
  return {
    defaultStatus:
      issues.defaultStatus !== undefined ? issues.defaultStatus : 'open',
    defaultPriority:
      issues.defaultPriority !== undefined ? issues.defaultPriority : 'medium',
    customFields: issues.customFields,
  }
}
