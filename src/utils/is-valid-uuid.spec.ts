import { describe, expect, it } from 'vitest'
import { isValidUuid } from './is-valid-uuid.js'

describe('isValidUuid', () => {
  it('returns true for valid UUIDs', () => {
    expect(isValidUuid('77ed0337-1654-4c29-bbf1-e226fc6e261d')).toBe(true)
    expect(isValidUuid('ABC12345-1234-1234-1234-123456789ABC')).toBe(true)
    expect(isValidUuid('00000000-0000-0000-0000-000000000000')).toBe(true)
  })

  it('returns false for invalid UUIDs', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false)
    expect(isValidUuid('123')).toBe(false)
    expect(isValidUuid('')).toBe(false)
    expect(isValidUuid('77ed0337-1654-4c29-bbf1')).toBe(false)
    expect(isValidUuid('77ed0337-1654-4c29-bbf1-e226fc6e261d-extra')).toBe(
      false
    )
  })

  it('returns false for display numbers', () => {
    expect(isValidUuid('1')).toBe(false)
    expect(isValidUuid('123')).toBe(false)
  })
})
