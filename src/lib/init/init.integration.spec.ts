import { Writable } from 'node:stream'
import { vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CentyManifest } from '../../types/centy-manifest.js'

// Mock node:fs/promises with memfs
vi.mock('node:fs/promises', async () => {
  const memfs = await import('memfs')
  return memfs.fs.promises
})

// Mock daemon client to force local fallback
vi.mock('../../daemon/daemon-get-reconciliation-plan.js', () => ({
  daemonGetReconciliationPlan: vi
    .fn()
    .mockRejectedValue(new Error('ECONNREFUSED')),
}))

vi.mock('../../daemon/daemon-execute-reconciliation.js', () => ({
  daemonExecuteReconciliation: vi
    .fn()
    .mockRejectedValue(new Error('ECONNREFUSED')),
}))

// Import after mocking
const { init } = await import('./init.js')

// Helper to create a writable stream that collects output
function createOutputCollector(): {
  stream: Writable
  getOutput: () => string
} {
  let output = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })
  return {
    stream,
    getOutput: () => output,
  }
}

describe('init integration tests', () => {
  beforeEach(() => {
    vol.reset()
  })

  describe('fresh initialization', () => {
    it('should create .centy folder structure in empty directory', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(result.centyPath).toBe('/project/.centy')
      expect(vol.existsSync('/project/.centy')).toBe(true)
    })

    it('should create issues directory', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/issues')).toBe(true)
      const stat = vol.statSync('/project/.centy/issues')
      expect(stat.isDirectory()).toBe(true)
    })

    it('should create docs directory', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/docs')).toBe(true)
      const stat = vol.statSync('/project/.centy/docs')
      expect(stat.isDirectory()).toBe(true)
    })

    it('should create README.md with correct content', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/README.md')).toBe(true)
      const content = vol.readFileSync('/project/.centy/README.md', 'utf8')

      expect(content).toContain('# .centy')
      expect(content).toContain('For AI Assistants')
      expect(content).toContain('issues/')
      expect(content).toContain('docs/')
      expect(content).toContain('.centy-manifest.json')
    })

    it('should create .centy-manifest.json with correct structure', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/.centy-manifest.json')).toBe(true)
      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      expect(manifest.schemaVersion).toBe(1)
      expect(manifest.centyVersion).toBeDefined()
      expect(manifest.createdAt).toBeDefined()
      expect(manifest.updatedAt).toBeDefined()
      expect(manifest.managedFiles).toBeInstanceOf(Array)
    })

    it('should track all managed files in manifest', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      const managedPaths = manifest.managedFiles.map(f => f.path)
      expect(managedPaths).toContain('issues/')
      expect(managedPaths).toContain('docs/')
      expect(managedPaths).toContain('README.md')
    })

    it('should return created files in result', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(result.created).toContain('issues/')
      expect(result.created).toContain('docs/')
      expect(result.created).toContain('README.md')
    })

    it('should output creation message', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Creating .centy folder')
    })
  })

  describe('existing folder reconciliation', () => {
    it('should detect existing .centy folder', async () => {
      vol.mkdirSync('/project/.centy', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Found existing .centy folder')
    })

    it('should preserve user-created files', async () => {
      vol.mkdirSync('/project/.centy/issues', { recursive: true })
      vol.writeFileSync('/project/.centy/issues/0001-my-issue.md', '# My Issue')

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/issues/0001-my-issue.md')).toBe(
        true
      )
      const content = vol.readFileSync(
        '/project/.centy/issues/0001-my-issue.md',
        'utf8'
      )
      expect(content).toBe('# My Issue')
      expect(result.userFiles).toContain('issues/0001-my-issue.md')
    })

    it('should create missing managed files', async () => {
      vol.mkdirSync('/project/.centy/issues', { recursive: true })

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/docs')).toBe(true)
      expect(vol.existsSync('/project/.centy/README.md')).toBe(true)
      expect(result.created).toContain('docs/')
      expect(result.created).toContain('README.md')
    })

    it('should report up-to-date files correctly', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector1 = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector1.stream,
      })

      const collector2 = createOutputCollector()
      const result = await init({
        cwd: '/project',
        force: true,
        output: collector2.stream,
      })

      expect(result.created).toHaveLength(0)
      expect(result.success).toBe(true)
    })
  })

  describe('manifest handling', () => {
    it('should create manifest with correct schema version', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      expect(manifest.schemaVersion).toBe(1)
    })

    it('should include file hashes in manifest', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      const readmeEntry = manifest.managedFiles.find(
        f => f.path === 'README.md'
      )
      expect(readmeEntry).toBeDefined()
      expect(readmeEntry!.hash).toBeDefined()
      expect(readmeEntry!.hash.length).toBeGreaterThan(0)
    })

    it('should include timestamps in manifest', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      expect(manifest.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(manifest.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('should include version in managed file entries', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(content as string)

      for (const file of manifest.managedFiles) {
        expect(file.version).toBeDefined()
      }
    })
  })

  describe('file content verification', () => {
    it('should create README.md with instructions for AI assistants', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/README.md',
        'utf8'
      ) as string

      expect(content).toContain('For AI Assistants')
      expect(content).toContain('Create issues in `issues/`')
      expect(content).toContain('NNNN-slug.md')
    })

    it('should create README.md with structure documentation', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const content = vol.readFileSync(
        '/project/.centy/README.md',
        'utf8'
      ) as string

      expect(content).toContain('## Structure')
      expect(content).toContain('`issues/`')
      expect(content).toContain('`docs/`')
    })
  })

  describe('edge cases', () => {
    it('should handle nested project directories', async () => {
      vol.mkdirSync('/home/user/projects/my-app', { recursive: true })

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/home/user/projects/my-app',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(vol.existsSync('/home/user/projects/my-app/.centy')).toBe(true)
      expect(vol.existsSync('/home/user/projects/my-app/.centy/issues')).toBe(
        true
      )
    })

    it('should work with paths containing spaces', async () => {
      vol.mkdirSync('/project with spaces', { recursive: true })

      const collector = createOutputCollector()
      const result = await init({
        cwd: '/project with spaces',
        force: true,
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(vol.existsSync('/project with spaces/.centy')).toBe(true)
    })

    it('should preserve existing subdirectories in managed directories', async () => {
      vol.mkdirSync('/project/.centy/issues/archived', { recursive: true })
      vol.writeFileSync('/project/.centy/issues/archived/old-issue.md', 'old')

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      expect(
        vol.existsSync('/project/.centy/issues/archived/old-issue.md')
      ).toBe(true)
    })
  })

  describe('output messages', () => {
    it('should output success message on completion', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Successfully initialized')
    })

    it('should list created files in output', async () => {
      vol.mkdirSync('/project', { recursive: true })

      const collector = createOutputCollector()
      await init({
        cwd: '/project',
        force: true,
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Created issues/')
      expect(output).toContain('Created docs/')
      expect(output).toContain('Created README.md')
    })
  })
})
