import type {
  OpenInTempVscodeRequest,
  OpenInTempVscodeResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Open a project in a temporary VS Code workspace
 */
export function daemonOpenInTempVscode(
  request: OpenInTempVscodeRequest
): Promise<OpenInTempVscodeResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().openInTempVscode(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
