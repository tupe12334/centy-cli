# LLM integration - TUI

Add LLM integration UI to the TUI:

- Add LLM config panel to view/edit agent configuration
- Show active work session status in the status bar or dedicated panel
- Add actions to spawn agents (plan/implement) on selected issues
- Display available agents and their status
- Allow selecting agent and action type from issue detail view
- Show prompt preview before spawning

Should use the daemon service to call LLM-related gRPC endpoints.

Parent issue: cf64f3d7-832f-4ba9-831b-2589a1c8e790 (centy-daemon)
