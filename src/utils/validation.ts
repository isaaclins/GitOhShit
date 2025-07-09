/**
 * Validation utilities for Git-O-Shit application
 */

/**
 * Validates if a string is a valid Git commit hash (SHA-1)
 */
export function isValidCommitHash(hash: string): boolean {
  if (typeof hash !== 'string') {
    return false;
  }
  
  // Full SHA-1 hash (40 characters) or abbreviated (7-39 characters)
  const validHashRegex = /^[a-f0-9]{7,40}$/i;
  
  return validHashRegex.test(hash);
}

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  
  // Basic email validation that rejects double dots and other common issues
  const emailRegex = /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a commit message meets basic requirements
 */
export function isValidCommitMessage(message: string): boolean {
  if (typeof message !== 'string') {
    return false;
  }
  
  // Must not be empty, not just whitespace, and reasonable length
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
}

/**
 * Validates if a branch name is valid according to Git rules
 */
export function isValidBranchName(name: string): boolean {
  if (typeof name !== 'string') {
    return false;
  }
  
  // Git branch name rules (simplified)
  // - Cannot be empty
  // - Cannot start or end with slash
  // - Cannot contain certain characters
  // - Cannot start with dash
  const invalidChars = /[\s~^:?*\[\]\\]/;
  const startsWithSlash = /^\//;
  const endsWithSlash = /\/$/;
  const startsWithDash = /^-/;
  const doubleDots = /\.\./;
  
  if (name.length === 0) return false;
  if (startsWithSlash.test(name)) return false;
  if (endsWithSlash.test(name)) return false;
  if (startsWithDash.test(name)) return false;
  if (doubleDots.test(name)) return false;
  if (invalidChars.test(name)) return false;
  
  return true;
}

/**
 * Validates if a tag name is valid
 */
export function isValidTagName(name: string): boolean {
  if (typeof name !== 'string') {
    return false;
  }
  
  // Similar to branch names but with some differences
  // Tags can start with 'v' for versions
  const invalidChars = /[\s~^:?*\[\]\\]/;
  const startsWithSlash = /^\//;
  const endsWithSlash = /\/$/;
  
  if (name.length === 0) return false;
  if (startsWithSlash.test(name)) return false;
  if (endsWithSlash.test(name)) return false;
  if (invalidChars.test(name)) return false;
  
  return true;
}

/**
 * Validates if a path could be a valid Git repository
 */
export function isValidRepositoryPath(path: string): boolean {
  if (typeof path !== 'string') {
    return false;
  }
  
  // Basic path validation - must be absolute path
  return path.length > 0 && (path.startsWith('/') || /^[A-Za-z]:\\/.test(path));
} 
