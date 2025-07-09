/**
 * Formatting utilities for Git-O-Shit application
 */
/**
 * Formats a commit hash for display (truncates to 7 characters)
 */
export declare function formatCommitHash(hash: string): string;
/**
 * Formats a date for display in commit history
 */
export declare function formatCommitDate(date: Date | string): string;
/**
 * Formats a relative time for display (e.g., "2 hours ago")
 */
export declare function formatRelativeTime(date: Date | string): string;
/**
 * Truncates a commit message for display
 */
export declare function formatCommitMessage(message: string, maxLength?: number): string;
/**
 * Formats a file path for display (shows only the filename and parent directory)
 */
export declare function formatFilePath(path: string): string;
/**
 * Formats a branch name for display (removes prefixes like refs/heads/)
 */
export declare function formatBranchName(branchName: string): string;
/**
 * Formats file size for display
 */
export declare function formatFileSize(bytes: number): string;
