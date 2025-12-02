import { mkdir, rm, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Writable } from 'node:stream'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock daemon client to force local fallback
vi.mock('./daemon/daemon-get-reconciliation-plan.js', () => ({
  daemonGetReconciliationPlan: vi
    .fn()
    .mockRejectedValue(new Error('ECONNREFUSED')),
}))

vi.mock('./daemon/daemon-execute-reconciliation.js', () => ({
  daemonExecuteReconciliation: vi
    .fn()
    .mockRejectedValue(new Error('ECONNREFUSED')),
}))

const { init } = await import('./lib/init/index.js')

/**
 * Create a writable stream that captures output to a string
 */
function createOutputCapture(): { stream: Writable; getOutput: () => string } {
  let output = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })
  return { stream, getOutput: () => output }
}

describe('init command', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `centy-test-${Date.now()}`)
    await mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should create .centy folder with force flag', async () => {
    const { stream, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Creating .centy folder')
    expect(getOutput()).toContain('Successfully initialized')

    // Verify folder structure
    const centyPath = join(tempDir, '.centy')
    const entries = await readdir(centyPath)
    expect(entries).toContain('issues')
    expect(entries).toContain('docs')
    expect(entries).toContain('README.md')
    expect(entries).toContain('.centy-manifest.json')
  })

  it('should create README.md with correct content', async () => {
    const { stream } = createOutputCapture()
    await init({ force: true, cwd: tempDir, output: stream })

    const readmePath = join(tempDir, '.centy', 'README.md')
    const content = await readFile(readmePath, 'utf8')
    expect(content).toContain('For AI Assistants')
    expect(content).toContain('issues/')
    expect(content).toContain('docs/')
  })

  it('should create manifest file', async () => {
    const { stream } = createOutputCapture()
    await init({ force: true, cwd: tempDir, output: stream })

    const manifestPath = join(tempDir, '.centy', '.centy-manifest.json')
    const content = await readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(content)
    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.managedFiles).toBeInstanceOf(Array)
    expect(manifest.managedFiles.length).toBeGreaterThan(0)
  })

  it('should detect existing folder and report', async () => {
    const { stream: stream1 } = createOutputCapture()
    // First init
    await init({ force: true, cwd: tempDir, output: stream1 })

    // Second init
    const { stream: stream2, getOutput } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream2 })

    expect(result.success).toBe(true)
    expect(getOutput()).toContain('Found existing .centy folder')
  })

  it('should return created files in result', async () => {
    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.success).toBe(true)
    expect(result.created).toContain('issues/')
    expect(result.created).toContain('docs/')
    expect(result.created).toContain('README.md')
  })

  it('should set centyPath in result', async () => {
    const { stream } = createOutputCapture()
    const result = await init({ force: true, cwd: tempDir, output: stream })

    expect(result.centyPath).toBe(join(tempDir, '.centy'))
  })
})
