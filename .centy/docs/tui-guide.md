---
title: 'TUI Guide'
createdAt: '2025-12-05T12:35:07.928808+00:00'
updatedAt: '2025-12-05T12:35:07.928808+00:00'
---

# TUI Guide

Complete guide for using Centy's interactive Terminal User Interface.

## Opening the TUI

Run `centy` without any arguments to open the interactive dashboard:

```bash
centy
```

## Layout

```
┌─────────────────────────────────────────────────────┐
│ Centy                              ● Daemon: Connected │
├──────────────┬──────────────────────────────────────┤
│ Projects     │                                      │
│ > Issues     │  Issue List                          │
│   Docs       │  ─────────────────────────           │
│   Assets     │  #1 [high] Fix login bug             │
│   Config     │  #2 [med]  Add dark mode             │
│   Daemon     │  #3 [low]  Update docs               │
├──────────────┴──────────────────────────────────────┤
│ j/k: navigate  Enter: select  Tab: switch view  q: quit │
└─────────────────────────────────────────────────────┘
```

The TUI has four main areas:

- **Header**: Shows the app name and daemon connection status
- **Sidebar**: Navigation between different views
- **Main Panel**: Content for the selected view
- **Status Bar**: Keyboard shortcuts for the current context

## Keyboard Shortcuts

### Navigation

| Key       | Action                                          |
| --------- | ----------------------------------------------- |
| `j` / `↓` | Move down                                       |
| `k` / `↑` | Move up                                         |
| `Enter`   | Select/open item                                |
| `Tab`     | Switch between sidebar and main panel           |
| `1-6`     | Quick jump to view (1=Projects, 2=Issues, etc.) |

### Global

| Key   | Action           |
| ----- | ---------------- |
| `q`   | Quit the TUI     |
| `Esc` | Go back / Cancel |

## Views

### Projects

Browse all tracked projects. Shows:

- Project name
- Issue and doc counts
- Initialization status

### Issues

List all issues in the current project with:

- Priority indicators (high/medium/low)
- Issue titles
- Status

### Docs

Browse documentation files stored in `.centy/docs/`.

### Assets

View assets attached to issues or shared across the project.

### Config

Display current project configuration.

### Daemon

Monitor daemon status and connection health.

## Tips

- The TUI automatically connects to the Centy daemon
- If the daemon is not running, start it with `centy start`
- Use number keys (1-6) for quick navigation between views
- The status bar updates to show relevant shortcuts for each view
