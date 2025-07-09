/**
 * Validation utilities for Git-O-Shit application
 */
/**
 * Validates if a string is a valid Git commit hash (SHA-1)
 */
export declare function isValidCommitHash(hash: string): boolean;
/**
 * Validates if a string is a valid email address
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validates if a commit message meets basic requirements
 */
export declare function isValidCommitMessage(message: string): boolean;
/**
 * Validates if a branch name is valid according to Git rules
 */
export declare function isValidBranchName(name: string): boolean;
/**
 * Validates if a tag name is valid
 */
export declare function isValidTagName(name: string): boolean;
/**
 * Validates if a path could be a valid Git repository
 */
export declare function isValidRepositoryPath(path: string): boolean;
