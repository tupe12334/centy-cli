import { useState } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useProjects } from '../../hooks/useProjects.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import type { ProjectInfo } from '../../../daemon/types.js'

export function ProjectList() {
  const { projects, isLoading, selectProject } = useProjects()
  const { navigate } = useNavigation()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'j' || event.name === 'down') {
      setSelectedIndex((prev: number) =>
        Math.min(prev + 1, projects.length - 1)
      )
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    } else if (event.name === 'return') {
      const project = projects[selectedIndex]
      if (project) {
        selectProject(project.path)
        navigate('issues')
      }
    }
  })

  if (isLoading) {
    return (
      <MainPanel title="Projects">
        <text fg="gray">Loading projects...</text>
      </MainPanel>
    )
  }

  if (projects.length === 0) {
    return (
      <MainPanel title="Projects">
        <text fg="gray">No projects found.</text>
        <text fg="gray">Use `centy register project` to add a project.</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title="Projects">
      {projects.map((project: ProjectInfo, index: number) => {
        const isSelected = index === selectedIndex
        const name =
          project.name || project.path.split('/').pop() || project.path

        return (
          <box key={project.path} height={2} flexDirection="column">
            <box flexDirection="row">
              <text bg={isSelected ? 'gray' : undefined}>
                {isSelected ? (
                  <b>
                    {'>'} {name}
                  </b>
                ) : (
                  ` ${name}`
                )}
              </text>
            </box>
            <box flexDirection="row" paddingLeft={3}>
              <text fg="gray">
                {project.issueCount} issues, {project.docCount} docs
              </text>
              {!project.initialized && (
                <text fg="yellow"> (not initialized)</text>
              )}
            </box>
          </box>
        )
      })}
    </MainPanel>
  )
}
