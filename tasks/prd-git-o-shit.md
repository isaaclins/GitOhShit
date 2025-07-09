# Product Requirements Document: Git-O-Shit Desktop Application

## Introduction/Overview

Git-O-Shit is a cross-platform desktop application designed to help individual developers visualize and edit their local Git repository history with an intuitive graphical interface. The application solves the common problem of needing to fix git mistakes such as incorrect commit messages, wrong dates, improper author information, or commits made to the wrong branch. Unlike traditional git tools that require complex command-line operations, Git-O-Shit provides a visual, node-based interface where users can easily navigate their repository's history and make corrections safely.

**Goal:** Enable developers to confidently fix git history mistakes through an intuitive visual interface without fear of losing work or damaging their repository.

## Goals

1. **Mistake Recovery:** Allow users to easily correct common git mistakes (commit messages, dates, authors, tags, branch placement)
2. **Visual Clarity:** Provide multiple visualization modes (linear, tree, timeline) to help users understand their repository structure
3. **Safety First:** Implement comprehensive backup and state-saving mechanisms to prevent data loss
4. **User-Friendly:** Start with beginner-friendly workflows that can scale to power-user functionality
5. **Cross-Platform:** Work seamlessly on Windows, macOS, and Linux with consistent behavior
6. **Local Focus:** Operate exclusively on local repositories to simplify scope and security

## User Stories

**As a developer who made a typo in a commit message**, I want to click on the commit node and edit the message so that my git history looks professional.

**As a developer who committed to the wrong branch**, I want to drag and drop the commit to the correct branch so that my feature development stays organized.

**As a developer who committed with the wrong date**, I want to edit the commit timestamp so that my contribution timeline reflects when I actually worked.

**As a developer trying to understand my project history**, I want to switch between different visualization modes (linear/tree/timeline) so that I can see my repository structure in the way that makes most sense for my current task.

**As a developer afraid of breaking my repository**, I want the app to automatically create save states before any changes so that I can always revert if something goes wrong.

**As a new git user**, I want guided workflows and clear warnings so that I can safely make changes without advanced git knowledge.

**As an experienced developer**, I want access to advanced editing features (squashing, splitting, reordering) so that I can efficiently clean up complex histories.

## Functional Requirements

1. **Repository Management**
   1.1. The system must allow users to open existing local Git repositories
   1.2. The system must display repository information (current branch, remote status, working directory state)
   1.3. The system must detect and warn if the working directory has uncommitted changes

2. **History Visualization**
   2.1. The system must display commit history as interactive nodes connected by lines
   2.2. The system must support linear view (single branch timeline)
   2.3. The system must support tree view (full branch/merge visualization)
   2.4. The system must support timeline view (chronological organization)
   2.5. The system must allow users to switch between visualization modes
   2.6. The system must display commit metadata (hash, message, author, date, tags) on node hover/selection

3. **Commit Editing**
   3.1. The system must allow editing commit messages
   3.2. The system must allow editing commit author name and email
   3.3. The system must allow editing commit dates (author date and commit date)
   3.4. The system must allow editing and adding commit tags
   3.5. The system must allow moving commits between branches (cherry-pick functionality)
   3.6. The system must allow reordering commits within a branch
   3.7. The system must allow squashing multiple commits
   3.8. The system must allow splitting commits (advanced feature)

4. **Safety Features**
   4.1. The system must create automatic backup branches before any destructive operations
   4.2. The system must maintain a "save state" system allowing users to revert changes
   4.3. The system must show clear warnings for potentially destructive operations
   4.4. The system must provide undo/redo functionality for recent operations
   4.5. The system must validate operations and prevent impossible git states

5. **User Interface**
   5.1. The system must provide a beginner mode with guided workflows and explanations
   5.2. The system must provide an advanced mode with quick access to all features
   5.3. The system must include a command palette for power users
   5.4. The system must show real-time feedback during operations
   5.5. The system must provide contextual help and tooltips

6. **Authentication & Integration**
   6.1. The system must use existing system Git credentials
   6.2. The system must respect existing Git configuration (user.name, user.email, etc.)
   6.3. The system must work with repositories using SSH keys
   6.4. The system must work with repositories using HTTPS authentication

## Non-Goals (Out of Scope)

- **Remote Repository Operations:** No cloning, pushing, pulling, or remote branch management
- **File Content Editing:** No built-in text editor or diff viewer for file contents
- **Repository Creation:** No ability to initialize new repositories
- **Conflict Resolution:** No merge conflict resolution interface
- **Plugin System:** No extensibility or plugin architecture
- **Real-time Collaboration:** No multi-user or real-time editing features
- **Git LFS Support:** No large file system integration
- **Submodule Management:** No submodule visualization or editing

## Design Considerations

- **Visual Design:** Clean, modern interface with intuitive node-based visualization
- **Responsive Layout:** Adaptable to different screen sizes and resolutions
- **Accessibility:** Keyboard navigation, screen reader support, high contrast modes
- **Performance:** Efficient rendering for repositories with thousands of commits
- **Theme Support:** Dark and light mode options

## Technical Considerations

- **Cross-Platform Framework:** Recommend Electron with TypeScript/React for rapid development and testing
- **Git Integration:** Use `libgit2` bindings or similar robust Git library for reliable operations
- **State Management:** Implement comprehensive state management for undo/redo and save states
- **Testing Strategy:** Unit tests, integration tests, and cross-platform CI/CD pipeline
- **Security:** No network operations, local file system access only
- **Performance:** Efficient graph rendering for large repositories (virtualization, lazy loading)

## Success Metrics

- **User Adoption:** 1000+ downloads within 6 months of release
- **User Satisfaction:** 90%+ positive feedback on ease of fixing git mistakes
- **Safety Record:** Zero reported cases of data loss due to application bugs
- **Cross-Platform Parity:** Feature parity across all supported platforms
- **Performance:** Repository with 10,000+ commits loads and renders within 5 seconds

## Open Questions

1. **Repository Size Limits:** What's the maximum repository size/commit count we should optimize for?
2. **Git Version Compatibility:** Which versions of Git should we support?
3. **Advanced Git Features:** Should we support Git worktrees, Git hooks, or other advanced features?
4. **Export/Import:** Should users be able to export/import their edit workflows or templates?
5. **Licensing:** What license should be used for the open-source release?
6. **Update Mechanism:** How should the application handle updates across platforms?
7. **Telemetry:** What anonymized usage data (if any) would be valuable for improving the product?
