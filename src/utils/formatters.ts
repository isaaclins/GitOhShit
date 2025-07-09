/**
 * Formatting utilities for Git-O-Shit application
 */

/**
 * Formats a commit hash for display (truncates to 7 characters)
 */
export function formatCommitHash(hash: string): string {
  if (typeof hash !== 'string' || hash.length === 0) {
    return '';
  }
  
  return hash.slice(0, 7);
}

/**
 * Formats a date for display in commit history
 */
export function formatCommitDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats a relative time for display (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    } else {
      return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
    }
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Truncates a commit message for display
 */
export function formatCommitMessage(message: string, maxLength: number = 72): string {
  if (typeof message !== 'string') {
    return '';
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  return trimmed.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a file path for display (shows only the filename and parent directory)
 */
export function formatFilePath(path: string): string {
  if (typeof path !== 'string' || path.length === 0) {
    return '';
  }
  
  const parts = path.split(/[/\\]/);
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  if (parts.length === 2) {
    return path;
  }
  
  // Show last two parts (parent directory and filename)
  return `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

/**
 * Formats a branch name for display (removes prefixes like refs/heads/)
 */
export function formatBranchName(branchName: string): string {
  if (typeof branchName !== 'string') {
    return '';
  }
  
  // Remove common Git reference prefixes
  let formatted = branchName
    .replace(/^refs\/heads\//, '')
    .replace(/^refs\/remotes\/origin\//, '')
    .replace(/^refs\/remotes\//, '');
  
  // Only remove origin/ if it's at the start and not part of refs/remotes/
  if (formatted.startsWith('origin/') && !branchName.startsWith('refs/remotes/')) {
    formatted = formatted.replace(/^origin\//, '');
  }
  
  return formatted;
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  // Round to 1 decimal place for units larger than bytes
  const formattedSize = unitIndex === 0 
    ? Math.floor(size).toString()
    : size.toFixed(1);
  
  return `${formattedSize} ${units[unitIndex]}`;
} 
