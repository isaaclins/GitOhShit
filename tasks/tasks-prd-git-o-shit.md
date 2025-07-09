# Task List: Git-O-Shit Desktop Application

Based on PRD: `prd-git-o-shit.md`

## Relevant Files

- `package.json` - Main package configuration with dependencies and scripts
- `electron.js` - Main Electron process entry point
- `src/main/main.ts` - Main process TypeScript entry point
- `src/renderer/index.html` - Renderer process HTML entry point
- `src/renderer/App.tsx` - Root React component
- `src/renderer/App.test.tsx` - Unit tests for App component
- `src/components/GitGraph/GitGraph.tsx` - Main git visualization component
- `src/components/GitGraph/GitGraph.test.tsx` - Unit tests for GitGraph
- `src/components/CommitNode/CommitNode.tsx` - Individual commit node component
- `src/components/CommitNode/CommitNode.test.tsx` - Unit tests for CommitNode
- `src/components/EditModal/EditModal.tsx` - Commit editing modal component
- `src/components/EditModal/EditModal.test.tsx` - Unit tests for EditModal
- `src/components/Repository/RepositoryManager.tsx` - Repository selection and management
- `src/components/Repository/RepositoryManager.test.tsx` - Unit tests for RepositoryManager
- `src/components/Layout/AppLayout.tsx` - Main application layout component
- `src/components/Layout/AppLayout.test.tsx` - Unit tests for AppLayout
- `src/lib/git/GitService.ts` - Core git operations service
- `src/lib/git/GitService.test.ts` - Unit tests for GitService
- `src/lib/git/types.ts` - TypeScript types for git objects
- `src/lib/visualization/GraphEngine.ts` - Graph layout and rendering engine
- `src/lib/visualization/GraphEngine.test.ts` - Unit tests for GraphEngine
- `src/lib/visualization/ViewModes.ts` - Different visualization modes logic
- `src/lib/visualization/ViewModes.test.ts` - Unit tests for ViewModes
- `src/lib/safety/BackupService.ts` - Backup and save state management
- `src/lib/safety/BackupService.test.ts` - Unit tests for BackupService
- `src/lib/safety/UndoRedoService.ts` - Undo/redo functionality
- `src/lib/safety/UndoRedoService.test.ts` - Unit tests for UndoRedoService
- `src/lib/editing/CommitEditor.ts` - Commit editing operations
- `src/lib/editing/CommitEditor.test.ts` - Unit tests for CommitEditor
- `src/lib/editing/BranchOperations.ts` - Branch and commit movement operations
- `src/lib/editing/BranchOperations.test.ts` - Unit tests for BranchOperations
- `src/hooks/useGitRepository.ts` - React hook for repository management
- `src/hooks/useGitRepository.test.ts` - Unit tests for useGitRepository hook
- `src/hooks/useCommitHistory.ts` - React hook for commit history state
- `src/hooks/useCommitHistory.test.ts` - Unit tests for useCommitHistory hook
- `src/contexts/AppStateContext.tsx` - Global application state context
- `src/contexts/AppStateContext.test.tsx` - Unit tests for AppStateContext
- `src/utils/validation.ts` - Input validation utilities
- `src/utils/validation.test.ts` - Unit tests for validation utilities
- `src/utils/formatters.ts` - Data formatting utilities
- `src/utils/formatters.test.ts` - Unit tests for formatters
- `src/types/index.ts` - Global TypeScript type definitions
- `webpack.config.js` - Webpack configuration for build process
- `jest.config.js` - Jest testing framework configuration
- `tsconfig.json` - TypeScript configuration
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline
- `.github/workflows/release.yml` - GitHub Actions release workflow

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm test` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Project Setup & Infrastructure
  - [x] 1.1 Initialize Electron project with TypeScript and React
  - [x] 1.2 Configure build system (Webpack, TypeScript, Electron Builder)
  - [x] 1.3 Setup testing framework (Jest, React Testing Library)
  - [x] 1.4 Configure linting and code formatting (ESLint, Prettier)
  - [ ] 1.5 Setup GitHub Actions CI/CD pipeline for cross-platform testing and building
  - [ ] 1.6 Create basic project structure and folder organization

- [ ] 2.0 Git Core Integration & Repository Management
  - [ ] 2.1 Integrate libgit2 bindings (nodegit or equivalent) for git operations
  - [ ] 2.2 Implement repository opening and validation functionality
  - [ ] 2.3 Create git status detection (working directory, staging area, current branch)
  - [ ] 2.4 Implement credential handling using system git configuration
  - [ ] 2.5 Create core git data models and TypeScript types
  - [ ] 2.6 Implement commit history parsing and caching

- [ ] 3.0 History Visualization Engine
  - [ ] 3.1 Implement graph layout algorithm for commit visualization
  - [ ] 3.2 Create linear view mode (single branch timeline)
  - [ ] 3.3 Create tree view mode (full branch/merge visualization)
  - [ ] 3.4 Create timeline view mode (chronological organization)
  - [ ] 3.5 Implement interactive commit nodes with hover/selection states
  - [ ] 3.6 Add performance optimization for large repositories (virtualization)
  - [ ] 3.7 Create view mode switching functionality

- [ ] 4.0 User Interface & Application Shell
  - [ ] 4.1 Create main application layout with sidebar and content areas
  - [ ] 4.2 Implement repository selection and management interface
  - [ ] 4.3 Create navigation and view mode switching controls
  - [ ] 4.4 Implement beginner/advanced mode toggling
  - [ ] 4.5 Create command palette component for power users
  - [ ] 4.6 Add theme support (dark/light mode)
  - [ ] 4.7 Implement responsive design for different screen sizes

- [ ] 5.0 Commit Editing System
  - [ ] 5.1 Create commit editing modal with form validation
  - [ ] 5.2 Implement commit message editing functionality
  - [ ] 5.3 Implement author name and email editing
  - [ ] 5.4 Implement commit date editing (author and commit dates)
  - [ ] 5.5 Implement tag editing and creation
  - [ ] 5.6 Create drag-and-drop functionality for commit movement between branches
  - [ ] 5.7 Implement commit reordering within branches
  - [ ] 5.8 Implement commit squashing functionality
  - [ ] 5.9 Implement commit splitting functionality (advanced feature)

- [ ] 6.0 Safety & Backup System
  - [ ] 6.1 Implement automatic backup branch creation before destructive operations
  - [ ] 6.2 Create save state system for operation rollback
  - [ ] 6.3 Implement undo/redo functionality with operation history
  - [ ] 6.4 Create warning dialogs for potentially destructive operations
  - [ ] 6.5 Implement git operation validation and error handling
  - [ ] 6.6 Create recovery mechanisms for failed operations
