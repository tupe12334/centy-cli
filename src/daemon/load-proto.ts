import { loadPackageDefinition, credentials } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ServiceError } from '@grpc/grpc-js'
import type {
  InitRequest,
  InitResponse,
  GetReconciliationPlanRequest,
  ReconciliationPlan,
  ExecuteReconciliationRequest,
  IsInitializedRequest,
  IsInitializedResponse,
  CreateIssueRequest,
  CreateIssueResponse,
  GetManifestRequest,
  Manifest,
  GetConfigRequest,
  Config,
} from './types.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = join(currentDir, '../../proto/centy.proto')

const DEFAULT_DAEMON_ADDRESS = '127.0.0.1:50051'

interface CentyDaemonClient {
  init(
    request: InitRequest,
    callback: (error: ServiceError | null, response: InitResponse) => void
  ): void
  getReconciliationPlan(
    request: GetReconciliationPlanRequest,
    callback: (error: ServiceError | null, response: ReconciliationPlan) => void
  ): void
  executeReconciliation(
    request: ExecuteReconciliationRequest,
    callback: (error: ServiceError | null, response: InitResponse) => void
  ): void
  isInitialized(
    request: IsInitializedRequest,
    callback: (
      error: ServiceError | null,
      response: IsInitializedResponse
    ) => void
  ): void
  createIssue(
    request: CreateIssueRequest,
    callback: (
      error: ServiceError | null,
      response: CreateIssueResponse
    ) => void
  ): void
  getManifest(
    request: GetManifestRequest,
    callback: (error: ServiceError | null, response: Manifest) => void
  ): void
  getConfig(
    request: GetConfigRequest,
    callback: (error: ServiceError | null, response: Config) => void
  ): void
}

interface ProtoDescriptor {
  centy: {
    CentyDaemon: new (
      address: string,
      creds: ReturnType<typeof credentials.createInsecure>
    ) => CentyDaemonClient
  }
}

let clientInstance: CentyDaemonClient | null = null

function getAddress(): string {
  const envAddr = process.env['CENTY_DAEMON_ADDR']
  if (envAddr !== undefined && envAddr !== '') {
    return envAddr
  }
  return DEFAULT_DAEMON_ADDRESS
}

/**
 * Load proto and create daemon client
 */
export function getDaemonClient(): CentyDaemonClient {
  if (clientInstance !== null) {
    return clientInstance
  }

  const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })

  const protoDescriptor = loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoDescriptor

  const address = getAddress()
  clientInstance = new protoDescriptor.centy.CentyDaemon(
    address,
    credentials.createInsecure()
  )

  return clientInstance
}
