import { useState } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useIssues } from '../../hooks/useIssues.js'
import { useAppState } from '../../state/app-state.js'
import type { Issue } from '../../../daemon/types.js'

function getPriorityColor(priority: number): string {
  if (priority === 1) return 'red'
  if (priority === 2) return 'yellow'
  return 'green'
}

function getPriorityLabel(priority: number, label?: string): string {
  if (label) return label
  if (priority === 1) return 'high'
  if (priority === 2) return 'med'
  return 'low'
}

export function IssueList() {
  const { issues, isLoading } = useIssues()
  const { state } = useAppState()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'j' || event.name === 'down') {
      setSelectedIndex((prev: number) => Math.min(prev + 1, issues.length - 1))
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Issues">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Issues - ${projectName}`}>
        <text fg="gray">Loading issues...</text>
      </MainPanel>
    )
  }

  if (issues.length === 0) {
    return (
      <MainPanel title={`Issues - ${projectName}`}>
        <text fg="gray">No issues found.</text>
        <text fg="gray">Press `n` to create a new issue.</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Issues - ${projectName}`}>
      {issues.map((issue: Issue, index: number) => {
        const isSelected = index === selectedIndex
        const priorityColor = getPriorityColor(issue.metadata.priority)
        const priorityLabel = getPriorityLabel(
          issue.metadata.priority,
          issue.metadata.priorityLabel
        )

        return (
          <box key={issue.id} height={1} flexDirection="row">
            <text bg={isSelected ? 'gray' : undefined}>
              {isSelected ? <b>{'>'}</b> : ' '}
            </text>
            <text fg="cyan">#{issue.displayNumber}</text>
            <text> </text>
            <text fg={priorityColor}>[{priorityLabel}]</text>
            <text> </text>
            <text fg="gray">[{issue.metadata.status}]</text>
            <text> </text>
            <text bg={isSelected ? 'gray' : undefined}>{issue.title}</text>
          </box>
        )
      })}
    </MainPanel>
  )
}
