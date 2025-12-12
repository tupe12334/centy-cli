const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id)
}
