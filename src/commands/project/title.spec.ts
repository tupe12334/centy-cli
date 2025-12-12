import { describe, expect, it } from 'vitest'

describe('Project Title command', () => {
  it('should have correct static properties', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
    expect(Command.examples).toBeDefined()
    expect(Array.isArray(Command.examples)).toBe(true)
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should have required flags', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command.flags).toBeDefined()
    expect(Command.flags.path).toBeDefined()
    expect(Command.flags.shared).toBeDefined()
    expect(Command.flags.clear).toBeDefined()
    expect(Command.flags.json).toBeDefined()
  })

  it('should have title argument', async () => {
    const { default: Command } = await import('./title.js')

    expect(Command.args).toBeDefined()
    expect(Command.args.title).toBeDefined()
  })
})
