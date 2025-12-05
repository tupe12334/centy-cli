interface Shortcut {
  key: string
  label: string
}

interface StatusBarProps {
  shortcuts: Shortcut[]
  error?: string | null
}

export function StatusBar({ shortcuts, error }: StatusBarProps) {
  if (error) {
    return (
      <box height={1} width="100%">
        <text fg="red">{error}</text>
      </box>
    )
  }

  return (
    <box height={1} width="100%" flexDirection="row" gap={2}>
      {shortcuts.map((shortcut, index) => (
        <box key={index} flexDirection="row">
          <text fg="yellow">
            <b>{shortcut.key}</b>
          </text>
          <text>: {shortcut.label}</text>
        </box>
      ))}
    </box>
  )
}
