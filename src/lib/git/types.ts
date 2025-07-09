/**
 * TypeScript types for Git operations
 * These are more specific implementations of the global types
 */

import { GitCommit, GitBranch, GitRepository } from '../../types';

// ===================
// Raw Git Data Types
// ===================

export interface RawGitCommit {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
  refs: string;
}

export interface GitLogOptions {
  maxCount?: number;
  skip?: number;
  since?: string;
  until?: string;
  author?: string;
  grep?: string;
  all?: boolean;
  graph?: boolean;
  format?: 'raw' | 'short' | 'full' | 'fuller' | 'oneline';
}

export interface GitDiffOptions {
  cached?: boolean;
  nameOnly?: boolean;
  nameStatus?: boolean;
  numstat?: boolean;
  stat?: boolean;
}

// ===================
// Git Command Results
// ===================

export interface GitCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
}

export interface GitLogResult {
  commits: GitCommit[];
  hasMore: boolean;
  total: number;
}

export interface GitStatusResult {
  current: string;
  tracking?: string;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
}

export interface GitFileStatus {
  path: string;
  index: string;
  working_dir: string;
  from?: string; // For renamed files
}

// ===================
// Git Operation Types
// ===================

export type GitOperation = 
  | 'clone'
  | 'fetch'
  | 'pull'
  | 'push'
  | 'commit'
  | 'merge'
  | 'rebase'
  | 'cherry-pick'
  | 'revert'
  | 'reset'
  | 'checkout'
  | 'branch'
  | 'tag'
  | 'stash';

export interface GitOperationOptions {
  force?: boolean;
  dryRun?: boolean;
  interactive?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

// ===================
// Git Configuration
// ===================

export interface GitServiceConfig {
  repositoryPath: string;
  credentials?: GitCredentials;
  config?: GitConfig;
}

export interface GitConfig {
  'user.name'?: string;
  'user.email'?: string;
  'core.editor'?: string;
  'core.autocrlf'?: string;
  'core.safecrlf'?: string;
  'push.default'?: string;
  'pull.rebase'?: string;
  [key: string]: string | undefined;
}

// ===================
// Git Credentials
// ===================

export interface GitCredentials {
  username?: string;
  password?: string;
  token?: string;
  sshKey?: string;
  passphrase?: string;
}

// ===================
// Git References
// ===================

export interface GitRef {
  name: string;
  hash: string;
  type: 'branch' | 'tag' | 'remote' | 'head';
  target?: string; // For symbolic refs
}

export interface GitReflog {
  hash: string;
  previousHash: string;
  author: string;
  date: Date;
  message: string;
  action: string;
}

// ===================
// Git Objects
// ===================

export interface GitBlob {
  hash: string;
  size: number;
  content: Buffer | string;
  encoding?: string;
}

export interface GitTree {
  hash: string;
  entries: GitTreeEntry[];
}

export interface GitTreeEntry {
  name: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  hash: string;
  size?: number;
}

// ===================
// Git Merge/Conflict Types
// ===================

export interface GitMergeResult {
  success: boolean;
  conflicts: GitConflict[];
  merged: string[];
  deleted: string[];
  created: string[];
}

export interface GitConflict {
  path: string;
  type: 'content' | 'add/add' | 'delete/modify' | 'modify/delete' | 'rename/rename';
  ours: string;
  theirs: string;
  base?: string;
}

// ===================
// Git Patch Types
// ===================

export interface GitPatch {
  from: string;
  to: string;
  hunks: GitHunk[];
  stats: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

export interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitLine[];
}

export interface GitLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  lineNumber?: number;
}

// ===================
// Git Stash Types
// ===================

export interface GitStash {
  index: number;
  name: string;
  message: string;
  date: Date;
  branch: string;
  commit: string;
}

// ===================
// Git Submodule Types
// ===================

export interface GitSubmodule {
  name: string;
  path: string;
  url: string;
  branch?: string;
  commit: string;
  status: 'uninitialized' | 'initialized' | 'updated' | 'modified';
}

// ===================
// Git Hook Types
// ===================

export type GitHookType = 
  | 'pre-commit'
  | 'post-commit'
  | 'pre-push'
  | 'post-push'
  | 'pre-receive'
  | 'post-receive'
  | 'update'
  | 'post-update'
  | 'pre-rebase'
  | 'post-checkout'
  | 'post-merge';

export interface GitHook {
  type: GitHookType;
  path: string;
  executable: boolean;
  content?: string;
}

// ===================
// Type Guards
// ===================

export function isGitCommit(obj: unknown): obj is GitCommit {
  return obj && 
    typeof obj === 'object' &&
    'hash' in obj &&
    typeof (obj as { hash: unknown }).hash === 'string' &&
    'message' in obj &&
    typeof (obj as { message: unknown }).message === 'string' &&
    'author' in obj &&
    (obj as { author: unknown }).author && 
    typeof (obj as { author: { name: unknown } }).author === 'object' &&
    'name' in (obj as { author: { name: unknown } }).author &&
    typeof (obj as { author: { name: unknown } }).author.name === 'string';
}

export function isGitBranch(obj: unknown): obj is GitBranch {
  return obj && 
    typeof obj === 'object' &&
    'name' in obj &&
    typeof (obj as { name: unknown }).name === 'string' &&
    'current' in obj &&
    typeof (obj as { current: unknown }).current === 'boolean' &&
    'commit' in obj &&
    typeof (obj as { commit: unknown }).commit === 'string';
}

export function isGitRepository(obj: unknown): obj is GitRepository {
  return obj && 
    typeof obj === 'object' &&
    'path' in obj &&
    typeof (obj as { path: unknown }).path === 'string' &&
    'name' in obj &&
    typeof (obj as { name: unknown }).name === 'string' &&
    'isValid' in obj &&
    typeof (obj as { isValid: unknown }).isValid === 'boolean' &&
    'branches' in obj &&
    Array.isArray((obj as { branches: unknown }).branches);
} 
