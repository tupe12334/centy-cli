/**
 * Unified daemon service layer for TUI
 * Wraps existing daemon functions with a cleaner API
 */

import { daemonListProjects } from '../../daemon/daemon-list-projects.js'
import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import { daemonListDocs } from '../../daemon/daemon-list-docs.js'
import { daemonGetConfig } from '../../daemon/daemon-get-config.js'
import { daemonGetDaemonInfo } from '../../daemon/daemon-get-daemon-info.js'
import { daemonShutdown } from '../../daemon/daemon-shutdown.js'
import { daemonRestart } from '../../daemon/daemon-restart.js'
import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'
import type {
  ProjectInfo,
  Issue,
  Doc,
  Config,
  DaemonInfo,
  ShutdownResponse,
  RestartResponse,
} from '../../daemon/types.js'

export interface DaemonServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export class DaemonService {
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    return checkDaemonConnection()
  }

  async listProjects(
    includeStale = false
  ): Promise<DaemonServiceResult<ProjectInfo[]>> {
    try {
      const response = await daemonListProjects({ includeStale })
      return { success: true, data: response.projects }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to list projects',
      }
    }
  }

  async listIssues(
    projectPath: string,
    filters?: { status?: string; priority?: number }
  ): Promise<DaemonServiceResult<Issue[]>> {
    try {
      const response = await daemonListIssues({
        projectPath,
        status: filters?.status,
        priority: filters?.priority,
      })
      return { success: true, data: response.issues }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list issues',
      }
    }
  }

  async listDocs(projectPath: string): Promise<DaemonServiceResult<Doc[]>> {
    try {
      const response = await daemonListDocs({ projectPath })
      return { success: true, data: response.docs }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list docs',
      }
    }
  }

  async getConfig(projectPath: string): Promise<DaemonServiceResult<Config>> {
    try {
      const response = await daemonGetConfig({ projectPath })
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get config',
      }
    }
  }

  async getDaemonInfo(): Promise<DaemonServiceResult<DaemonInfo>> {
    try {
      const response = await daemonGetDaemonInfo({})
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get daemon info',
      }
    }
  }

  async shutdown(
    delaySeconds?: number
  ): Promise<DaemonServiceResult<ShutdownResponse>> {
    try {
      const response = await daemonShutdown({ delaySeconds })
      return { success: true, data: response }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      // CANCELLED error means daemon shut down before responding - this is success
      if (msg.includes('CANCELLED')) {
        return {
          success: true,
          data: { success: true, message: 'Daemon shutdown initiated' },
        }
      }
      return {
        success: false,
        error: msg || 'Failed to shutdown daemon',
      }
    }
  }

  async restart(
    delaySeconds?: number
  ): Promise<DaemonServiceResult<RestartResponse>> {
    try {
      const response = await daemonRestart({ delaySeconds })
      return { success: true, data: response }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      // CANCELLED error means daemon shut down before responding - this is success
      if (msg.includes('CANCELLED')) {
        return {
          success: true,
          data: { success: true, message: 'Daemon restart initiated' },
        }
      }
      return {
        success: false,
        error: msg || 'Failed to restart daemon',
      }
    }
  }
}

export const daemonService = new DaemonService()
