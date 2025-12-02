/**
 * Configuration for custom issue fields
 */
export interface CustomFieldDefinition {
  /** Field data type */
  type: 'string' | 'number' | 'boolean' | 'array'
  /** Default value for the field */
  default?: unknown
  /** Whether field is required */
  required?: boolean
}
