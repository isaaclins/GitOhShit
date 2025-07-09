/**
 * Global TypeScript type definitions for Git-O-Shit
 */

// ===================
// Git Types
// ===================

export interface GitCommit {
  hash: string;
  shortHash: string;
  author: {
    name: string;
    email: string;
    date: Date;
  };
  committer: {
    name: string;
    email: string;
    date: Date;
  };
  message: string;
  summary: string;
  body?: string;
  parents: string[];
  refs: string[];
  tags: string[];
  branches: string[];
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
  remote?: string;
  upstream?: string;
}

export interface GitRepository {
  path: string;
  name: string;
  isValid: boolean;
  currentBranch: string;
  branches: GitBranch[];
  remotes: GitRemote[];
  status: GitStatus;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: string;
  push: string;
}

export interface GitStatus {
  current: string;
  tracking?: string;
  ahead: number;
  behind: number;
  created: string[];
  deleted: string[];
  modified: string[];
  renamed: string[];
  staged: string[];
  conflicted: string[];
  not_added: string[];
}

export interface GitTag {
  name: string;
  commit: string;
  date: Date;
  message?: string;
  annotated: boolean;
}

// ===================
// Visualization Types
// ===================

export type ViewMode = 'linear' | 'tree' | 'timeline';

export interface CommitNode {
  commit: GitCommit;
  x: number;
  y: number;
  radius: number;
  selected: boolean;
  highlighted: boolean;
  branch: string;
  level: number;
}

export interface CommitConnection {
  from: string;
  to: string;
  branch: string;
  type: 'parent' | 'merge' | 'branch';
  points: { x: number; y: number }[];
}

export interface GraphLayout {
  nodes: CommitNode[];
  connections: CommitConnection[];
  branches: VisualBranch[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface VisualBranch {
  name: string;
  color: string;
  level: number;
  commits: string[];
  startY: number;
  endY: number;
}

// ===================
// UI State Types
// ===================

export type AppMode = 'beginner' | 'advanced';

export interface AppState {
  repository: GitRepository | null;
  commits: GitCommit[];
  selectedCommits: string[]; // Keep for backward compatibility
  selectedCommit: string | null; // Single commit selection for vertical tab interface
  currentView: ViewMode;
  mode: AppMode;
  isLoading: boolean;
  error: string | null;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  // Branch filtering
  selectedBranch: string | null; // null means show all branches
  availableBranches: string[];
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  operation: string;
  description: string;
  data: any;
  reversible: boolean;
}

// ===================
// Editing Types
// ===================

export interface CommitEdit {
  hash: string;
  changes: {
    message?: string;
    author?: {
      name?: string;
      email?: string;
      date?: Date;
    };
    committer?: {
      name?: string;
      email?: string;
      date?: Date;
    };
  };
}

export interface BranchOperation {
  type: 'move' | 'reorder' | 'squash' | 'split';
  commits: string[];
  targetBranch?: string;
  targetPosition?: number;
  data?: any;
}

export interface BackupState {
  id: string;
  timestamp: Date;
  description: string;
  branch: string;
  repositoryState: {
    commits: GitCommit[];
    branches: GitBranch[];
    head: string;
  };
}

// ===================
// Component Props Types
// ===================

export interface GitGraphProps {
  commits: GitCommit[];
  layout: GraphLayout;
  viewMode: ViewMode;
  selectedCommits: string[];
  onCommitSelect: (commitHash: string, multi?: boolean) => void;
  onCommitEdit: (commit: GitCommit) => void;
  _onCommitMove: (commitHash: string, targetBranch: string, position: number) => void;
}

export interface CommitNodeProps {
  node: CommitNode;
  selected: boolean;
  highlighted: boolean;
  onClick: (commitHash: string, multi?: boolean) => void;
  onDoubleClick: (commit: GitCommit) => void;
  _onDragStart: (commitHash: string) => void;
  _onDragEnd: (commitHash: string, target: { branch: string; position: number }) => void;
}

export interface EditModalProps {
  commit: GitCommit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (edit: CommitEdit) => void;
  mode: AppMode;
}

// ===================
// Hook Return Types
// ===================

export interface UseGitRepositoryReturn {
  repository: GitRepository | null;
  commits: GitCommit[];
  branches: GitBranch[];
  isLoading: boolean;
  error: string | null;
  openRepository: (path: string) => Promise<void>;
  closeRepository: () => void;
  refreshRepository: () => Promise<void>;
}

export interface UseCommitHistoryReturn {
  commits: GitCommit[];
  selectedCommits: string[];
  selectCommit: (commitHash: string, multi?: boolean) => void;
  clearSelection: () => void;
  editCommit: (edit: CommitEdit) => Promise<void>;
  isEditing: boolean;
  error: string | null;
}

// ===================
// Service Types
// ===================

export interface GitServiceConfig {
  repositoryPath: string;
  maxCommits?: number;
  includeMerges?: boolean;
  branchFilter?: string[];
}

export interface GraphEngineConfig {
  nodeRadius: number;
  nodeSpacing: number;
  branchSpacing: number;
  animationDuration: number;
  colors: {
    [branchName: string]: string;
  };
}

// ===================
// Event Types
// ===================

export interface CommitSelectEvent {
  commitHash: string;
  multi: boolean;
  timestamp: Date;
}

export interface CommitEditEvent {
  commitHash: string;
  edit: CommitEdit;
  timestamp: Date;
}

export interface BranchOperationEvent {
  operation: BranchOperation;
  timestamp: Date;
  success: boolean;
  error?: string;
}

// ===================
// Validation Types
// ===================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CommitValidation extends ValidationResult {
  field: 'message' | 'author' | 'date';
}

// ===================
// Configuration Types
// ===================

export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  defaultView: ViewMode;
  defaultMode: AppMode;
  autoBackup: boolean;
  maxUndoLevels: number;
  gitPath?: string;
  editor?: string;
}

// ===================
// Error Types
// ===================

export class GitError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'GitError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  field: string;
  
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
} 
