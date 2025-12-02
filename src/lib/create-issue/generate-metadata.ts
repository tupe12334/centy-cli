import type { CustomFieldDefinition } from '../../types/custom-field-definition.js'
import type { IssueMetadata } from '../../types/issue-metadata.js'

interface GenerateMetadataOptions {
  status: string
  priority: 'low' | 'medium' | 'high'
  customFields?: Record<string, unknown>
  configCustomFields?: Record<string, CustomFieldDefinition>
}

/**
 * Generate metadata.json content
 */
export function generateMetadata(
  options: GenerateMetadataOptions
): IssueMetadata {
  const now = new Date().toISOString()

  const metadata: IssueMetadata = {
    status: options.status,
    priority: options.priority,
    createdAt: now,
    updatedAt: now,
  }

  // Add default values for custom fields from config
  if (options.configCustomFields) {
    for (const [fieldName, fieldDef] of Object.entries(
      options.configCustomFields
    )) {
      if (fieldDef.default !== undefined) {
        metadata[fieldName] = fieldDef.default
      }
    }
  }

  // Override with provided custom field values
  if (options.customFields) {
    for (const [key, value] of Object.entries(options.customFields)) {
      metadata[key] = value
    }
  }

  return metadata
}
