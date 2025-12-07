import { describe, expect, it } from 'vitest'
import { init } from './init.js'

describe('init', () => {
  it('should return error when daemon is not running', async () => {
    const result = await init({
      cwd: '/nonexistent/path',
    })

    expect(result.success).toBe(false)
  })

  it('should return result with required properties', async () => {
    const result = await init({
      cwd: '/nonexistent/path',
    })

    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('centyPath')
    expect(result).toHaveProperty('created')
    expect(result).toHaveProperty('restored')
    expect(result).toHaveProperty('reset')
    expect(result).toHaveProperty('skipped')
    expect(result).toHaveProperty('userFiles')
  })
})
