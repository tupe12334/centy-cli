/* eslint-disable single-export/single-export */
import type { GithubRelease } from './types.js'
import { GithubApiError, ReleaseNotFoundError } from './errors.js'

// eslint-disable-next-line default/no-hardcoded-urls -- Fallback for standard GitHub API
const DEFAULT_GITHUB_API = 'https://api.github.com'
const GITHUB_API_BASE = process.env.GITHUB_API_URL ?? DEFAULT_GITHUB_API
const REPO_OWNER = 'centy-io'
const REPO_NAME = 'centy-daemon'

/**
 * Fetch the latest release from GitHub
 * Multiple exports allowed for related GitHub API operations
 */
export async function fetchLatestRelease(): Promise<GithubRelease> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    throw new GithubApiError(
      `Failed to fetch latest release: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<GithubRelease>
}

export async function fetchRelease(version: string): Promise<GithubRelease> {
  const tag = version.startsWith('v') ? version : `v${version}`
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${tag}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'centy-cli',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new ReleaseNotFoundError(tag)
    }
    throw new GithubApiError(
      `Failed to fetch release ${tag}: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<GithubRelease>
}
