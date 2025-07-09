import '@testing-library/jest-dom';

// Mock Electron API for testing
Object.defineProperty(window, 'electronAPI', {
  value: {
    onMenuOpenRepository: jest.fn(),
    onMenuCloseRepository: jest.fn(),
    onMenuViewLinear: jest.fn(),
    onMenuViewTree: jest.fn(),
    onMenuViewTimeline: jest.fn(),
    openRepository: jest.fn(),
    getCommitHistory: jest.fn(),
    editCommit: jest.fn(),
    selectDirectory: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  writable: true,
}); 
