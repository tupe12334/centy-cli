import { describe, expect, it } from 'vitest'
import {
  InstallDaemonError,
  PlatformNotSupportedError,
  ChecksumNotFoundError,
  DownloadError,
  ReleaseNotFoundError,
  GithubApiError,
} from './errors.js'

describe('InstallDaemonError', () => {
  it('should create error with correct message', () => {
    const error = new InstallDaemonError('test message')
    expect(error.message).toBe('test message')
    expect(error.name).toBe('InstallDaemonError')
  })

  it('should be instanceof Error', () => {
    const error = new InstallDaemonError('test')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('PlatformNotSupportedError', () => {
  it('should include platform and arch in message', () => {
    const error = new PlatformNotSupportedError('freebsd', 'mips')
    expect(error.message).toContain('freebsd')
    expect(error.message).toContain('mips')
    expect(error.name).toBe('PlatformNotSupportedError')
  })

  it('should be instanceof InstallDaemonError', () => {
    const error = new PlatformNotSupportedError('test', 'test')
    expect(error).toBeInstanceOf(InstallDaemonError)
  })
})

describe('ChecksumNotFoundError', () => {
  it('should include filename in message', () => {
    const error = new ChecksumNotFoundError('daemon.tar.gz')
    expect(error.message).toContain('daemon.tar.gz')
    expect(error.name).toBe('ChecksumNotFoundError')
  })
})

describe('DownloadError', () => {
  it('should create error with message', () => {
    const error = new DownloadError('Failed to download')
    expect(error.message).toBe('Failed to download')
    expect(error.name).toBe('DownloadError')
  })
})

describe('ReleaseNotFoundError', () => {
  it('should include version in message', () => {
    const error = new ReleaseNotFoundError('v1.0.0')
    expect(error.message).toContain('v1.0.0')
    expect(error.name).toBe('ReleaseNotFoundError')
  })
})

describe('GithubApiError', () => {
  it('should create error with message', () => {
    const error = new GithubApiError('API rate limited')
    expect(error.message).toBe('API rate limited')
    expect(error.name).toBe('GithubApiError')
  })
})
