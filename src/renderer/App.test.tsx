import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './app';

// Type declaration for electronAPI in tests
declare global {
  interface Window {
    electronAPI: {
      onMenuOpenRepository: jest.Mock;
      onMenuCloseRepository: jest.Mock;
      onMenuViewLinear: jest.Mock;
      onMenuViewTree: jest.Mock;
      onMenuViewTimeline: jest.Mock;
      validateRepository: jest.Mock;
      openRepository: jest.Mock;
      getCommits: jest.Mock;
      getCommitHistory: jest.Mock;
      editCommit: jest.Mock;
      selectDirectory: jest.Mock;
      removeAllListeners: jest.Mock;
    };
  }
}

// Mock the electronAPI
const mockElectronAPI = {
  onMenuOpenRepository: jest.fn(),
  onMenuCloseRepository: jest.fn(),
  onMenuViewLinear: jest.fn(),
  onMenuViewTree: jest.fn(),
  onMenuViewTimeline: jest.fn(),
  validateRepository: jest.fn(),
  openRepository: jest.fn(),
  getCommits: jest.fn(),
  getCommitHistory: jest.fn(),
  editCommit: jest.fn(),
  selectDirectory: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders welcome screen initially', () => {
    render(<App />);
    
    expect(screen.getByText('Welcome to Git-O-Shit')).toBeInTheDocument();
    expect(screen.getByText('A visual Git history browser that helps you understand your repository.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '📁 Open Repository' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '📁 Open Git Repository' })).toBeInTheDocument();
  });

  test('renders header with title', () => {
    render(<App />);
    
    expect(screen.getByText('Git-O-Shit')).toBeInTheDocument();
  });

  test('calls selectDirectory when Open Repository button is clicked', async () => {
    const user = userEvent.setup();
    mockElectronAPI.selectDirectory.mockResolvedValue('/path/to/repo');
    mockElectronAPI.validateRepository.mockResolvedValue(true);
    mockElectronAPI.openRepository.mockResolvedValue({
      name: 'test-repo',
      path: '/path/to/repo',
      currentBranch: 'main',
      branches: [],
      remotes: [],
      status: { 
        current: 'main',
        ahead: 0, 
        behind: 0, 
        created: [],
        deleted: [],
        modified: [], 
        renamed: [],
        staged: [],
        conflicted: [],
        not_added: []
      }
    });
    mockElectronAPI.getCommits.mockResolvedValue({ commits: [] });
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: '📁 Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    expect(mockElectronAPI.selectDirectory).toHaveBeenCalled();
  });

  test('displays repository info when repository is loaded', async () => {
    const user = userEvent.setup();
    const mockRepoPath = '/path/to/test/repo';
    const mockRepository = {
      name: 'test-repo',
      path: mockRepoPath,
      currentBranch: 'main',
      branches: [{ name: 'main', current: true, commit: 'abc123' }],
      remotes: [],
      status: { 
        current: 'main',
        ahead: 0, 
        behind: 0, 
        created: [],
        deleted: [],
        modified: [], 
        renamed: [],
        staged: [],
        conflicted: [],
        not_added: []
      }
    };
    const mockCommits = [{
      hash: 'abc123',
      shortHash: 'abc123',
      message: 'Test commit',
      summary: 'Test commit',
      author: { 
        name: 'Test User', 
        email: 'test@example.com',
        date: new Date() 
      },
      committer: { 
        name: 'Test User', 
        email: 'test@example.com',
        date: new Date() 
      },
      parents: [],
      refs: [],
      tags: [],
      branches: ['main']
    }];
    
    mockElectronAPI.selectDirectory.mockResolvedValue(mockRepoPath);
    mockElectronAPI.validateRepository.mockResolvedValue(true);
    mockElectronAPI.openRepository.mockResolvedValue(mockRepository);
    mockElectronAPI.getCommits.mockResolvedValue({ commits: mockCommits });
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: '📁 Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
      expect(screen.getByText('📍 main')).toBeInTheDocument();
      expect(screen.getByText('📝 1 commits')).toBeInTheDocument();
    });
    
    // Should show close button when repository is loaded
    expect(screen.getByRole('button', { name: '✕ Close' })).toBeInTheDocument();
  });

  test('displays commit list when repository is loaded', async () => {
    const user = userEvent.setup();
    const mockCommits = [{
      hash: 'abc123def456',
      shortHash: 'abc123d',
      message: 'Initial commit',
      summary: 'Initial commit',
      author: { 
        name: 'Test User', 
        email: 'test@example.com',
        date: new Date('2024-01-15') 
      },
      committer: { 
        name: 'Test User', 
        email: 'test@example.com',
        date: new Date('2024-01-15') 
      },
      parents: [],
      refs: [],
      tags: [],
      branches: ['main']
    }];
    
    mockElectronAPI.selectDirectory.mockResolvedValue('/test/repo');
    mockElectronAPI.validateRepository.mockResolvedValue(true);
    mockElectronAPI.openRepository.mockResolvedValue({
      name: 'test-repo',
      currentBranch: 'main',
      branches: [],
      remotes: [],
      status: { 
        current: 'main',
        ahead: 0, 
        behind: 0, 
        created: [],
        deleted: [],
        modified: [], 
        renamed: [],
        staged: [],
        conflicted: [],
        not_added: []
      }
    });
    mockElectronAPI.getCommits.mockResolvedValue({ commits: mockCommits });
    
    render(<App />);
    
    // Open repository
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '📁 Open Repository' }));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Initial commit')).toBeInTheDocument();
      expect(screen.getByText('abc123d')).toBeInTheDocument();
    });
  });

  test('handles repository validation failure', async () => {
    const user = userEvent.setup();
    mockElectronAPI.selectDirectory.mockResolvedValue('/invalid/path');
    mockElectronAPI.validateRepository.mockResolvedValue(false);
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: '📁 Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Selected directory is not a valid Git repository/)).toBeInTheDocument();
    });
  });

  test('sets up electron menu listeners on mount', () => {
    render(<App />);
    
    expect(mockElectronAPI.onMenuOpenRepository).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuCloseRepository).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewLinear).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewTree).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewTimeline).toHaveBeenCalled();
  });

  test('handles selectDirectory cancellation gracefully', async () => {
    const user = userEvent.setup();
    mockElectronAPI.selectDirectory.mockResolvedValue(null); // User cancelled
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: '📁 Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    // Should not show any error when user cancels
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test('handles undefined electronAPI gracefully', () => {
    // Temporarily remove electronAPI
    const originalAPI = window.electronAPI;
    // @ts-expect-error - Temporarily removing electronAPI for test
    delete window.electronAPI;
    
    // Should not throw error
    expect(() => render(<App />)).not.toThrow();
    
    // Restore electronAPI
    window.electronAPI = originalAPI;
  });

  test('closes repository when close button is clicked', async () => {
    const user = userEvent.setup();
    
    // First open a repository
    mockElectronAPI.selectDirectory.mockResolvedValue('/test/repo');
    mockElectronAPI.validateRepository.mockResolvedValue(true);
    mockElectronAPI.openRepository.mockResolvedValue({
      name: 'test-repo',
      currentBranch: 'main',
      branches: [],
      remotes: [],
      status: { 
        current: 'main',
        ahead: 0, 
        behind: 0, 
        created: [],
        deleted: [],
        modified: [], 
        renamed: [],
        staged: [],
        conflicted: [],
        not_added: []
      }
    });
    mockElectronAPI.getCommits.mockResolvedValue({ commits: [] });
    
    render(<App />);
    
    // Open repository
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '📁 Open Repository' }));
    });
    
    // Wait for repository to load
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });
    
    // Close repository
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '✕ Close' }));
    });
    
    // Should return to welcome screen
    await waitFor(() => {
      expect(screen.getByText('Welcome to Git-O-Shit')).toBeInTheDocument();
    });
  });
}); 
