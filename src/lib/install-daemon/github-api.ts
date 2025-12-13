/* eslint-disable single-export/single-export */
import { Octokit } from '@octokit/rest'
import type { GithubRelease } from './types.js'
import { GithubApiError, ReleaseNotFoundError } from './errors.js'

// eslint-disable-next-line default/no-hardcoded-urls -- Fallback for standard GitHub API
const DEFAULT_GITHUB_API = 'https://api.github.com'
// eslint-disable-next-line no-restricted-syntax
const GITHUB_API_BASE = process.env.GITHUB_API_URL ?? DEFAULT_GITHUB_API
const REPO_OWNER = 'centy-io'
const REPO_NAME = 'centy-daemon'

const octokit = new Octokit({
  baseUrl: GITHUB_API_BASE,
  userAgent: 'centy-cli',
})

interface OctokitError {
  status?: number
  message?: string
}

function isOctokitError(error: unknown): error is OctokitError {
  return typeof error === 'object' && error !== null && 'status' in error
}

/**
 * Fetch the latest release from GitHub
 * Falls back to most recent pre-release if no stable release exists
 * Multiple exports allowed for related GitHub API operations
 */
export async function fetchLatestRelease(): Promise<GithubRelease> {
  try {
    // Try stable release first
    const { data } = await octokit.repos.getLatestRelease({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    })
    return data
  } catch (error: unknown) {
    // Fall back to most recent release (including pre-releases)
    if (isOctokitError(error) && error.status === 404) {
      try {
        const { data: releases } = await octokit.repos.listReleases({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          per_page: 1,
        })
        if (releases.length > 0) {
          return releases[0]
        }
      } catch {
        // Fall through to error
      }
      throw new GithubApiError('No releases found for centy-daemon')
    }

    if (isOctokitError(error)) {
      throw new GithubApiError(
        `Failed to fetch latest release: ${error.status} ${error.message || ''}`
      )
    }
    throw new GithubApiError('Failed to fetch latest release: Unknown error')
  }
}

export async function fetchRelease(version: string): Promise<GithubRelease> {
  const tag = version.startsWith('v') ? version : `v${version}`
  try {
    const { data } = await octokit.repos.getReleaseByTag({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tag,
    })
    return data
  } catch (error: unknown) {
    if (isOctokitError(error) && error.status === 404) {
      throw new ReleaseNotFoundError(tag)
    }
    if (isOctokitError(error)) {
      throw new GithubApiError(
        `Failed to fetch release ${tag}: ${error.status} ${error.message || ''}`
      )
    }
    throw new GithubApiError(`Failed to fetch release ${tag}: Unknown error`)
  }
}
