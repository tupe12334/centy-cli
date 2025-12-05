import { useState, useRef, useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useProjects } from '../../hooks/useProjects.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import type { ProjectInfo } from '../../../daemon/types.js'

const ITEM_HEIGHT = 2

interface ProjectItemProps {
  project: ProjectInfo
  isSelected: boolean
}

function ProjectItem({ project, isSelected }: ProjectItemProps) {
  const name = project.name || project.path.split('/').pop() || project.path

  return (
    <box key={project.path} height={ITEM_HEIGHT} flexDirection="column">
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
        {!project.initialized && <text fg="yellow"> (not initialized)</text>}
      </box>
    </box>
  )
}

export function ProjectList() {
  const { projects, isLoading, selectProject } = useProjects()
  const { navigate } = useNavigation()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  useEffect(() => {
    if (scrollBoxRef.current) {
      const targetScrollTop = selectedIndex * ITEM_HEIGHT
      const viewportHeight = scrollBoxRef.current.viewport.height
      const currentScrollTop = scrollBoxRef.current.scrollTop

      if (targetScrollTop < currentScrollTop) {
        scrollBoxRef.current.scrollTo(targetScrollTop)
      } else if (
        targetScrollTop + ITEM_HEIGHT >
        currentScrollTop + viewportHeight
      ) {
        scrollBoxRef.current.scrollTo(
          targetScrollTop - viewportHeight + ITEM_HEIGHT
        )
      }
    }
  }, [selectedIndex])

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
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {projects.map((project: ProjectInfo, index: number) => (
          <ProjectItem
            key={project.path}
            project={project}
            isSelected={index === selectedIndex}
          />
        ))}
      </scrollbox>
    </MainPanel>
  )
}
