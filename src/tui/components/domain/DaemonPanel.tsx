import { MainPanel } from '../layout/MainPanel.js'
import { useDaemonConnection } from '../../hooks/useDaemonConnection.js'
import { useDaemonInfo } from '../../hooks/useDaemonInfo.js'
import {
  useDaemonActions,
  type ActionState,
} from '../../hooks/useDaemonActions.js'
import type { DaemonInfo } from '../../../daemon/types.js'

interface DaemonInfoDisplayProps {
  daemonInfo: DaemonInfo
}

function DaemonInfoDisplay({ daemonInfo }: DaemonInfoDisplayProps) {
  return (
    <>
      <box flexDirection="row">
        <text>Version: </text>
        <text fg="cyan">{daemonInfo.version}</text>
      </box>
      {daemonInfo.availableVersions.length > 0 && (
        <box flexDirection="column">
          <text fg="gray">Available versions:</text>
          <box paddingLeft={2}>
            <text fg="gray">{daemonInfo.availableVersions.join(', ')}</text>
          </box>
        </box>
      )}
    </>
  )
}

function DaemonControls() {
  return (
    <box marginTop={1} flexDirection="column">
      <text>
        <b>Controls</b>
      </text>
      <box paddingLeft={1} flexDirection="column">
        <text fg="gray">[s] Shutdown daemon</text>
        <text fg="gray">[r] Restart daemon</text>
        <text fg="gray">[c] Check connection</text>
      </box>
    </box>
  )
}

interface ActionMessageProps {
  message: string
  actionState: ActionState
}

function ActionMessage({ message, actionState }: ActionMessageProps) {
  const color =
    actionState === 'confirming'
      ? 'yellow'
      : message.startsWith('Error')
        ? 'red'
        : 'green'

  return (
    <box marginTop={1}>
      <text fg={color}>{message}</text>
    </box>
  )
}

interface DisconnectedViewProps {
  actionMessage: string | null
}

function DisconnectedView({ actionMessage }: DisconnectedViewProps) {
  return (
    <MainPanel title="Daemon">
      <box flexDirection="column" gap={1}>
        <box flexDirection="row">
          <text>Status: </text>
          <text fg="red">Disconnected</text>
        </box>
        <text fg="gray">The daemon is not running or cannot be reached.</text>
        <box marginTop={1}>
          <text fg="gray">[c] Check connection</text>
        </box>
        {actionMessage && (
          <box marginTop={1}>
            <text fg="yellow">{actionMessage}</text>
          </box>
        )}
      </box>
    </MainPanel>
  )
}

export function DaemonPanel() {
  const { connected, retry } = useDaemonConnection()
  const { daemonInfo, isLoading } = useDaemonInfo({ connected })
  const { actionState, actionMessage } = useDaemonActions({ connected, retry })

  if (!connected) {
    return <DisconnectedView actionMessage={actionMessage} />
  }

  if (isLoading) {
    return (
      <MainPanel title="Daemon">
        <text fg="gray">Loading daemon info...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title="Daemon">
      <box flexDirection="column" gap={1}>
        <box flexDirection="row">
          <text>Status: </text>
          <text fg="green">Connected</text>
        </box>
        {daemonInfo && <DaemonInfoDisplay daemonInfo={daemonInfo} />}
        <DaemonControls />
        {actionMessage && (
          <ActionMessage message={actionMessage} actionState={actionState} />
        )}
      </box>
    </MainPanel>
  )
}
