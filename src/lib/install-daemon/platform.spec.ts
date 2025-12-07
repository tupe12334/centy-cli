import { describe, expect, it } from 'vitest'
import { getPlatformTarget } from './platform.js'

describe('getPlatformTarget', () => {
  it('should return platform target with required properties', () => {
    const target = getPlatformTarget()

    expect(target).toHaveProperty('platform')
    expect(target).toHaveProperty('arch')
    expect(target).toHaveProperty('target')
    expect(target).toHaveProperty('extension')
  })

  it('should return tar.gz extension for non-windows platforms', () => {
    const target = getPlatformTarget()

    if (target.platform !== 'win32') {
      expect(target.extension).toBe('tar.gz')
    }
  })

  it('should return zip extension for windows', () => {
    const target = getPlatformTarget()

    if (target.platform === 'win32') {
      expect(target.extension).toBe('zip')
    }
  })

  it('should return valid rust target triple', () => {
    const target = getPlatformTarget()

    // Rust target triples follow pattern: arch-vendor-os(-env)
    expect(target.target).toMatch(/^[a-z0-9_]+-[a-z]+-[a-z]+/)
  })
})
