import type { SpawnAgentRequest, SpawnAgentResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Spawn an LLM agent to work on an issue
 */
export function daemonSpawnAgent(
  request: SpawnAgentRequest
): Promise<SpawnAgentResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().spawnAgent(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
