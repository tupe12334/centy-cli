/* eslint-disable single-export/single-export */
/**
 * Custom error classes for install-daemon module
 * Multiple exports allowed for related error class hierarchy
 */

export class InstallDaemonError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InstallDaemonError'
  }
}

export class PlatformNotSupportedError extends InstallDaemonError {
  constructor(platform: string, arch: string) {
    super(`Unsupported platform: ${platform} ${arch}`)
    this.name = 'PlatformNotSupportedError'
  }
}

export class ChecksumNotFoundError extends InstallDaemonError {
  constructor(fileName: string) {
    super(`No checksum found for ${fileName}`)
    this.name = 'ChecksumNotFoundError'
  }
}

export class DownloadError extends InstallDaemonError {
  constructor(message: string) {
    super(message)
    this.name = 'DownloadError'
  }
}

export class ReleaseNotFoundError extends InstallDaemonError {
  constructor(version: string) {
    super(`Release ${version} not found`)
    this.name = 'ReleaseNotFoundError'
  }
}

export class GithubApiError extends InstallDaemonError {
  constructor(message: string) {
    super(message)
    this.name = 'GithubApiError'
  }
}
