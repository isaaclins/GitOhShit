import {
  isValidCommitHash,
  isValidEmail,
  isValidCommitMessage,
  isValidBranchName,
  isValidTagName,
  isValidRepositoryPath,
} from './validation';

describe('Validation Utilities', () => {
  describe('isValidCommitHash', () => {
    test('accepts valid full SHA-1 hashes', () => {
      expect(isValidCommitHash('a1b2c3d4e5f6789012345678901234567890abcd')).toBe(true);
      expect(isValidCommitHash('1234567890abcdef1234567890abcdef12345678')).toBe(true);
      expect(isValidCommitHash('ABCDEF1234567890ABCDEF1234567890ABCDEF12')).toBe(true);
    });

    test('accepts valid short SHA-1 hashes (7+ characters)', () => {
      expect(isValidCommitHash('a1b2c3d')).toBe(true);
      expect(isValidCommitHash('1234567')).toBe(true);
      expect(isValidCommitHash('abcdef1234')).toBe(true);
      expect(isValidCommitHash('1234567890abcdef')).toBe(true);
    });

    test('rejects invalid hashes', () => {
      expect(isValidCommitHash('')).toBe(false);
      expect(isValidCommitHash('123456')).toBe(false); // Too short
      expect(isValidCommitHash('g1b2c3d')).toBe(false); // Invalid character
      expect(isValidCommitHash('a1b2c3d4e5f6789012345678901234567890abcde')).toBe(false); // Too long (41 chars)
      expect(isValidCommitHash('a1b2c3d4e5f6789012345678901234567890abcdef1')).toBe(false); // Too long (42 chars)
    });

    test('rejects non-string inputs', () => {
      expect(isValidCommitHash(null as any)).toBe(false);
      expect(isValidCommitHash(undefined as any)).toBe(false);
      expect(isValidCommitHash(123 as any)).toBe(false);
      expect(isValidCommitHash({} as any)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    test('accepts valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('firstname.lastname@company.com')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test..test@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false); // Space
    });

    test('rejects non-string inputs', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
    });
  });

  describe('isValidCommitMessage', () => {
    test('accepts valid commit messages', () => {
      expect(isValidCommitMessage('Fix bug in authentication')).toBe(true);
      expect(isValidCommitMessage('Add new feature for user management')).toBe(true);
      expect(isValidCommitMessage('a')).toBe(true); // Single character
      expect(isValidCommitMessage('  Valid message with spaces  ')).toBe(true);
    });

    test('rejects invalid commit messages', () => {
      expect(isValidCommitMessage('')).toBe(false);
      expect(isValidCommitMessage('   ')).toBe(false); // Only whitespace
      expect(isValidCommitMessage('\t\n')).toBe(false); // Only whitespace characters
      
      // Too long message (over 1000 characters)
      const longMessage = 'a'.repeat(1001);
      expect(isValidCommitMessage(longMessage)).toBe(false);
    });

    test('accepts message at maximum length', () => {
      const maxMessage = 'a'.repeat(1000);
      expect(isValidCommitMessage(maxMessage)).toBe(true);
    });

    test('rejects non-string inputs', () => {
      expect(isValidCommitMessage(null as any)).toBe(false);
      expect(isValidCommitMessage(undefined as any)).toBe(false);
      expect(isValidCommitMessage(123 as any)).toBe(false);
    });
  });

  describe('isValidBranchName', () => {
    test('accepts valid branch names', () => {
      expect(isValidBranchName('main')).toBe(true);
      expect(isValidBranchName('feature/user-auth')).toBe(true);
      expect(isValidBranchName('bugfix/fix-login')).toBe(true);
      expect(isValidBranchName('release/v1.2.3')).toBe(true);
      expect(isValidBranchName('hotfix_critical_bug')).toBe(true);
    });

    test('rejects invalid branch names', () => {
      expect(isValidBranchName('')).toBe(false);
      expect(isValidBranchName('/invalid')).toBe(false); // Starts with slash
      expect(isValidBranchName('invalid/')).toBe(false); // Ends with slash
      expect(isValidBranchName('-invalid')).toBe(false); // Starts with dash
      expect(isValidBranchName('feature..main')).toBe(false); // Double dots
      expect(isValidBranchName('branch with spaces')).toBe(false);
      expect(isValidBranchName('branch~with~special')).toBe(false);
      expect(isValidBranchName('branch^with^caret')).toBe(false);
      expect(isValidBranchName('branch:with:colon')).toBe(false);
      expect(isValidBranchName('branch?with?question')).toBe(false);
      expect(isValidBranchName('branch*with*star')).toBe(false);
      expect(isValidBranchName('branch[with]brackets')).toBe(false);
      expect(isValidBranchName('branch\\with\\backslash')).toBe(false);
    });

    test('rejects non-string inputs', () => {
      expect(isValidBranchName(null as any)).toBe(false);
      expect(isValidBranchName(undefined as any)).toBe(false);
      expect(isValidBranchName(123 as any)).toBe(false);
    });
  });

  describe('isValidTagName', () => {
    test('accepts valid tag names', () => {
      expect(isValidTagName('v1.0.0')).toBe(true);
      expect(isValidTagName('release-1.2.3')).toBe(true);
      expect(isValidTagName('milestone')).toBe(true);
      expect(isValidTagName('2023.12.01')).toBe(true);
      expect(isValidTagName('stable_release')).toBe(true);
    });

    test('rejects invalid tag names', () => {
      expect(isValidTagName('')).toBe(false);
      expect(isValidTagName('/invalid')).toBe(false); // Starts with slash
      expect(isValidTagName('invalid/')).toBe(false); // Ends with slash
      expect(isValidTagName('tag with spaces')).toBe(false);
      expect(isValidTagName('tag~with~special')).toBe(false);
      expect(isValidTagName('tag^with^caret')).toBe(false);
      expect(isValidTagName('tag:with:colon')).toBe(false);
      expect(isValidTagName('tag?with?question')).toBe(false);
      expect(isValidTagName('tag*with*star')).toBe(false);
      expect(isValidTagName('tag[with]brackets')).toBe(false);
      expect(isValidTagName('tag\\with\\backslash')).toBe(false);
    });

    test('rejects non-string inputs', () => {
      expect(isValidTagName(null as any)).toBe(false);
      expect(isValidTagName(undefined as any)).toBe(false);
      expect(isValidTagName(123 as any)).toBe(false);
    });
  });

  describe('isValidRepositoryPath', () => {
    test('accepts valid Unix absolute paths', () => {
      expect(isValidRepositoryPath('/home/user/repo')).toBe(true);
      expect(isValidRepositoryPath('/var/www/project')).toBe(true);
      expect(isValidRepositoryPath('/Users/developer/workspace/git-project')).toBe(true);
      expect(isValidRepositoryPath('/')).toBe(true); // Root directory
    });

    test('accepts valid Windows absolute paths', () => {
      expect(isValidRepositoryPath('C:\\Users\\Developer\\Project')).toBe(true);
      expect(isValidRepositoryPath('D:\\workspace\\repo')).toBe(true);
      expect(isValidRepositoryPath('C:\\')).toBe(true); // Root drive
    });

    test('rejects invalid paths', () => {
      expect(isValidRepositoryPath('')).toBe(false);
      expect(isValidRepositoryPath('relative/path')).toBe(false);
      expect(isValidRepositoryPath('./relative')).toBe(false);
      expect(isValidRepositoryPath('../relative')).toBe(false);
      expect(isValidRepositoryPath('~/home')).toBe(false); // Tilde expansion
    });

    test('rejects non-string inputs', () => {
      expect(isValidRepositoryPath(null as any)).toBe(false);
      expect(isValidRepositoryPath(undefined as any)).toBe(false);
      expect(isValidRepositoryPath(123 as any)).toBe(false);
    });
  });
}); 
