import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the electronAPI
const mockElectronAPI = {
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
    expect(screen.getByText('A visual Git history editor that helps you fix your git mistakes.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Repository' })).toBeInTheDocument();
  });

  test('renders header with title and mode toggle', () => {
    render(<App />);
    
    expect(screen.getByText('Git-O-Shit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advanced Mode' })).toBeInTheDocument();
  });

  test('toggles between beginner and advanced mode', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const modeToggle = screen.getByRole('button', { name: 'Advanced Mode' });
    expect(modeToggle).toBeInTheDocument();
    
    // Click to switch to advanced mode
    await act(async () => {
      await user.click(modeToggle);
    });
    expect(screen.getByRole('button', { name: 'Beginner Mode' })).toBeInTheDocument();
    
    // Click to switch back to beginner mode
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Beginner Mode' }));
    });
    expect(screen.getByRole('button', { name: 'Advanced Mode' })).toBeInTheDocument();
  });

  test('calls selectDirectory when Open Repository button is clicked', async () => {
    const user = userEvent.setup();
    mockElectronAPI.selectDirectory.mockResolvedValue('/path/to/repo');
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: 'Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    expect(mockElectronAPI.selectDirectory).toHaveBeenCalled();
  });

  test('displays repository view when repository is selected', async () => {
    const user = userEvent.setup();
    const mockRepoPath = '/path/to/test/repo';
    mockElectronAPI.selectDirectory.mockResolvedValue(mockRepoPath);
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: 'Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(mockRepoPath)).toBeInTheDocument();
    });
    
    // Should show view mode buttons
    expect(screen.getByRole('button', { name: 'Linear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tree' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timeline' })).toBeInTheDocument();
    
    // Should show placeholder visualization
    expect(screen.getByText('Git Visualization - linear view')).toBeInTheDocument();
  });

  test('switches between view modes', async () => {
    const user = userEvent.setup();
    const mockRepoPath = '/path/to/test/repo';
    mockElectronAPI.selectDirectory.mockResolvedValue(mockRepoPath);
    
    render(<App />);
    
    // Open repository first
    const openButton = screen.getByRole('button', { name: 'Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(mockRepoPath)).toBeInTheDocument();
    });
    
    // Switch to tree view
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Tree' }));
    });
    expect(screen.getByText('Git Visualization - tree view')).toBeInTheDocument();
    
    // Switch to timeline view
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Timeline' }));
    });
    expect(screen.getByText('Git Visualization - timeline view')).toBeInTheDocument();
    
    // Switch back to linear view
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Linear' }));
    });
    expect(screen.getByText('Git Visualization - linear view')).toBeInTheDocument();
  });

  test('displays mode information in repository view', async () => {
    const user = userEvent.setup();
    const mockRepoPath = '/path/to/test/repo';
    mockElectronAPI.selectDirectory.mockResolvedValue(mockRepoPath);
    
    render(<App />);
    
    // Open repository
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Open Repository' }));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Mode: Beginner')).toBeInTheDocument();
    });
    
    // Switch to advanced mode
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Advanced Mode' }));
    });
    expect(screen.getByText('Mode: Advanced')).toBeInTheDocument();
  });

  test('sets up electron menu listeners on mount', () => {
    render(<App />);
    
    expect(mockElectronAPI.onMenuOpenRepository).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuCloseRepository).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewLinear).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewTree).toHaveBeenCalled();
    expect(mockElectronAPI.onMenuViewTimeline).toHaveBeenCalled();
  });

  test('handles selectDirectory rejection gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockElectronAPI.selectDirectory.mockRejectedValue(new Error('Selection failed'));
    
    render(<App />);
    
    const openButton = screen.getByRole('button', { name: 'Open Repository' });
    await act(async () => {
      await user.click(openButton);
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to open repository:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  test('handles undefined electronAPI gracefully', () => {
    // Temporarily remove electronAPI
    const originalAPI = window.electronAPI;
    // @ts-ignore
    delete window.electronAPI;
    
    // Should not throw error
    expect(() => render(<App />)).not.toThrow();
    
    // Restore electronAPI
    window.electronAPI = originalAPI;
  });
}); 
