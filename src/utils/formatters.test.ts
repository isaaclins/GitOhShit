import {
  formatCommitHash,
  formatCommitDate,
  formatRelativeTime,
  formatCommitMessage,
  formatFilePath,
  formatBranchName,
  formatFileSize,
} from './formatters';

describe('Formatter Utilities', () => {
  describe('formatCommitHash', () => {
    test('truncates long hashes to 7 characters', () => {
      expect(formatCommitHash('a1b2c3d4e5f6789012345678901234567890abcd')).toBe('a1b2c3d');
      expect(formatCommitHash('1234567890abcdef1234567890abcdef12345678')).toBe('1234567');
    });

    test('returns short hashes as-is if 7 characters or less', () => {
      expect(formatCommitHash('a1b2c3d')).toBe('a1b2c3d');
      expect(formatCommitHash('12345')).toBe('12345');
    });

    test('handles empty and invalid inputs', () => {
      expect(formatCommitHash('')).toBe('');
      expect(formatCommitHash(null as unknown as string)).toBe('');
      expect(formatCommitHash(undefined as unknown as string)).toBe('');
      expect(formatCommitHash(123 as unknown as string)).toBe('');
    });
  });

  describe('formatCommitDate', () => {
    test('formats Date objects correctly', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const formatted = formatCommitDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    test('formats ISO date strings correctly', () => {
      const formatted = formatCommitDate('2024-01-15T14:30:00Z');
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    test('handles invalid dates', () => {
      expect(formatCommitDate('invalid-date')).toBe('Invalid Date');
      expect(formatCommitDate('')).toBe('Invalid Date');
      expect(formatCommitDate(null as unknown)).toBe('Invalid Date');
      expect(formatCommitDate(undefined as unknown)).toBe('Invalid Date');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('formats recent times correctly', () => {
      expect(formatRelativeTime(new Date('2024-01-15T11:59:30Z'))).toBe('just now');
      expect(formatRelativeTime(new Date('2024-01-15T11:59:00Z'))).toBe('1 minute ago');
      expect(formatRelativeTime(new Date('2024-01-15T11:55:00Z'))).toBe('5 minutes ago');
      expect(formatRelativeTime(new Date('2024-01-15T11:00:00Z'))).toBe('1 hour ago');
      expect(formatRelativeTime(new Date('2024-01-15T09:00:00Z'))).toBe('3 hours ago');
    });

    test('formats older times correctly', () => {
      expect(formatRelativeTime(new Date('2024-01-14T12:00:00Z'))).toBe('1 day ago');
      expect(formatRelativeTime(new Date('2024-01-10T12:00:00Z'))).toBe('5 days ago');
      expect(formatRelativeTime(new Date('2024-01-01T12:00:00Z'))).toBe('2 weeks ago');
      expect(formatRelativeTime(new Date('2023-12-15T12:00:00Z'))).toBe('1 month ago');
      expect(formatRelativeTime(new Date('2023-01-15T12:00:00Z'))).toBe('1 year ago');
    });

    test('handles singular vs plural correctly', () => {
      expect(formatRelativeTime(new Date('2024-01-15T11:59:00Z'))).toBe('1 minute ago');
      expect(formatRelativeTime(new Date('2024-01-15T11:58:00Z'))).toBe('2 minutes ago');
      expect(formatRelativeTime(new Date('2024-01-15T11:00:00Z'))).toBe('1 hour ago');
      expect(formatRelativeTime(new Date('2024-01-15T10:00:00Z'))).toBe('2 hours ago');
    });

    test('handles invalid dates', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Invalid Date');
      expect(formatRelativeTime(null as unknown)).toBe('Invalid Date');
    });
  });

  describe('formatCommitMessage', () => {
    test('returns message as-is if within limit', () => {
      expect(formatCommitMessage('Short message')).toBe('Short message');
      expect(formatCommitMessage('Exactly 72 characters long message that should not be truncated!')).toBe('Exactly 72 characters long message that should not be truncated!');
    });

    test('truncates long messages with ellipsis', () => {
      const longMessage = 'This is a very long commit message that exceeds the maximum length and should be truncated';
      const formatted = formatCommitMessage(longMessage, 50);
      expect(formatted).toBe('This is a very long commit message that exceeds...');
      expect(formatted.length).toBe(50);
    });

    test('respects custom maxLength parameter', () => {
      const message = 'This message will be truncated';
      expect(formatCommitMessage(message, 10)).toBe('This me...');
      expect(formatCommitMessage(message, 20)).toBe('This message will...');
    });

    test('trims whitespace', () => {
      expect(formatCommitMessage('  Message with spaces  ')).toBe('Message with spaces');
    });

    test('handles empty and invalid inputs', () => {
      expect(formatCommitMessage('')).toBe('');
      expect(formatCommitMessage('   ')).toBe('');
      expect(formatCommitMessage(null as unknown)).toBe('');
      expect(formatCommitMessage(undefined as unknown)).toBe('');
    });
  });

  describe('formatFilePath', () => {
    test('shows filename only for single segment', () => {
      expect(formatFilePath('filename.txt')).toBe('filename.txt');
    });

    test('shows full path for two segments', () => {
      expect(formatFilePath('dir/file.txt')).toBe('dir/file.txt');
      expect(formatFilePath('folder\\file.txt')).toBe('folder\\file.txt');
    });

    test('truncates long paths to show parent and filename', () => {
      expect(formatFilePath('/very/long/path/to/file.txt')).toBe('.../to/file.txt');
      expect(formatFilePath('C:\\Users\\Developer\\Project\\src\\file.ts')).toBe('.../src/file.ts');
    });

    test('handles empty and invalid inputs', () => {
      expect(formatFilePath('')).toBe('');
      expect(formatFilePath(null as unknown)).toBe('');
      expect(formatFilePath(undefined as unknown)).toBe('');
    });
  });

  describe('formatBranchName', () => {
    test('removes Git reference prefixes', () => {
      expect(formatBranchName('refs/heads/main')).toBe('main');
      expect(formatBranchName('refs/heads/feature/auth')).toBe('feature/auth');
      expect(formatBranchName('refs/remotes/origin/main')).toBe('main');
    });

    test('removes origin prefix', () => {
      expect(formatBranchName('origin/main')).toBe('main');
      expect(formatBranchName('origin/feature/auth')).toBe('feature/auth');
    });

    test('leaves clean branch names unchanged', () => {
      expect(formatBranchName('main')).toBe('main');
      expect(formatBranchName('feature/auth')).toBe('feature/auth');
      expect(formatBranchName('release/v1.0.0')).toBe('release/v1.0.0');
    });

    test('handles empty and invalid inputs', () => {
      expect(formatBranchName('')).toBe('');
      expect(formatBranchName(null as unknown)).toBe('');
      expect(formatBranchName(undefined as unknown)).toBe('');
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    test('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 10)).toBe('10.0 KB');
    });

    test('formats megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    test('formats gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1.2)).toBe('1.2 GB');
    });

    test('formats terabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB');
    });

    test('handles invalid inputs', () => {
      expect(formatFileSize(-1)).toBe('0 B');
      expect(formatFileSize(null as unknown)).toBe('0 B');
      expect(formatFileSize(undefined as unknown)).toBe('0 B');
      expect(formatFileSize('invalid' as unknown)).toBe('0 B');
    });
  });
}); 
