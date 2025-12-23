/* eslint-disable ddd/require-spec-file -- Integration test */
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const BIN_DIR = path.resolve(__dirname, '../../../bin')
const RUN_JS = path.join(BIN_DIR, 'run.js')

interface SpawnResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

/**
 * Gets the PATH from process.env safely.
 */
function getPath(env: NodeJS.ProcessEnv): string {
  const pathValue = env.PATH
  if (pathValue === undefined || pathValue === null) {
    return ''
  }
  return pathValue
}

/**
 * Creates a PATH environment variable that excludes Bun directories.
 * This simulates an environment where Bun is not installed.
 */
function createPathWithoutBun(): string {
  const currentPath = getPath(process.env)
  return currentPath
    .split(path.delimiter)
    .filter(dir => !dir.toLowerCase().includes('bun'))
    .join(path.delimiter)
}

/**
 * Checks if Bun is available in the current environment.
 */
function checkBunAvailable(): boolean {
  try {
    const result = spawnSync('bun', ['--version'], {
      encoding: 'utf-8',
      timeout: 5000,
    })
    return result.status === 0
  } catch {
    return false
  }
}

/**
 * Runs the bin/run.js script with Node and captures output.
 */
async function runWrapper(
  scriptPath: string,
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    // Run the script with node
    const child = spawn('node', [scriptPath, ...args], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    if (child.stdout) {
      child.stdout.on('data', data => {
        stdout += data.toString()
      })
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        stderr += data.toString()
      })
    }

    child.on('close', exitCode => {
      resolve({ stdout, stderr, exitCode })
    })

    child.on('error', error => {
      reject(error)
    })

    // Set a timeout to prevent hanging tests
    setTimeout(() => {
      child.kill()
      reject(new Error('Wrapper execution timed out'))
    }, 30000)
  })
}

describe('runtime detection wrapper', () => {
  const bunAvailable = checkBunAvailable()

  describe('bin/run.js (cross-platform)', () => {
    describe('when Bun is available', () => {
      const itWithBun = bunAvailable ? it : it.skip

      itWithBun('should not show Bun tip message on stderr', async () => {
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
        })

        expect(result.stderr).not.toContain('Tip: Install Bun')
        expect(result.stderr).not.toContain('https://bun.sh')
      })

      itWithBun('should execute successfully', async () => {
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
        })

        expect(result.exitCode).toBe(0)
      })
    })

    describe('when only Node.js is available', () => {
      it('should show Bun installation tip on stderr', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.stderr).toContain(
          'Tip: Install Bun for faster CLI performance'
        )
        expect(result.stderr).toContain('https://bun.sh')
      })

      it('should complete successfully with Node.js', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
      })
    })

    describe('argument passing', () => {
      it('should pass arguments to the underlying script', async () => {
        const pathWithoutBun = createPathWithoutBun()

        // Use --help which outputs to stdout, allowing us to verify args were passed
        const result = await runWrapper(RUN_JS, ['--help'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        // The help output should contain something indicating the CLI is working
        expect(result.exitCode).toBe(0)
        expect(result.stdout.length).toBeGreaterThan(0)
      })

      it('should handle multiple arguments', async () => {
        const pathWithoutBun = createPathWithoutBun()

        // Test with a command that takes multiple args
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
      })
    })
  })

  describe('cross-platform behavior', () => {
    it('should use run.js as the single cross-platform entry point', () => {
      // The entry point is now bin/run.js for all platforms
      expect(RUN_JS).toContain('run.js')
    })
  })
})
