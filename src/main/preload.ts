import { contextBridge, ipcRenderer } from 'electron';
import { GitRepository, GitCommit } from '../types';

// Define the API that will be exposed to the renderer process
interface ElectronAPI {
  // Menu events
  onMenuOpenRepository: (callback: () => void) => void;
  onMenuCloseRepository: (callback: () => void) => void;
  onMenuViewLinear: (callback: () => void) => void;
  onMenuViewTree: (callback: () => void) => void;
  onMenuViewTimeline: (callback: () => void) => void;
  
  // Git operations
  validateRepository: (path: string) => Promise<boolean>;
  openRepository: (path: string) => Promise<GitRepository>;
  getCommits: (path: string, options?: { maxCount?: number }) => Promise<GitCommit[]>;
  getCommitHistory: (repoPath: string) => Promise<GitCommit[]>;
  editCommit: (repoPath: string, commitHash: string, changes: Record<string, unknown>) => Promise<boolean>;
  
  // File system operations
  selectDirectory: () => Promise<string | null>;
  
  // Auto-updater
  checkForUpdates: () => Promise<void>;
  restartAndInstall: () => Promise<void>;
  onUpdateChecking: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: unknown) => void) => void;
  onUpdateNotAvailable: (callback: (info: unknown) => void) => void;
  onUpdateError: (callback: (message: string) => void) => void;
  onUpdateDownloadProgress: (callback: (progress: unknown) => void) => void;
  onUpdateDownloaded: (callback: (info: unknown) => void) => void;
  
  // Utility functions
  removeAllListeners: (channel: string) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // Menu event listeners
  onMenuOpenRepository: (callback) => {
    ipcRenderer.on('menu-open-repository', callback);
  },
  onMenuCloseRepository: (callback) => {
    ipcRenderer.on('menu-close-repository', callback);
  },
  onMenuViewLinear: (callback) => {
    ipcRenderer.on('menu-view-linear', callback);
  },
  onMenuViewTree: (callback) => {
    ipcRenderer.on('menu-view-tree', callback);
  },
  onMenuViewTimeline: (callback) => {
    ipcRenderer.on('menu-view-timeline', callback);
  },
  
  // Git operations
  validateRepository: (path: string) => {
    return ipcRenderer.invoke('git-validate-repository', path);
  },
  openRepository: (path: string) => {
    return ipcRenderer.invoke('git-open-repository', path);
  },
  getCommits: (path: string, options?: { maxCount?: number }) => {
    return ipcRenderer.invoke('git-get-commits', path, options);
  },
  getCommitHistory: (repoPath: string) => {
    return ipcRenderer.invoke('git-get-commit-history', repoPath);
  },
  editCommit: (repoPath: string, commitHash: string, changes: Record<string, unknown>) => {
    return ipcRenderer.invoke('git-edit-commit', repoPath, commitHash, changes);
  },
  
  // File system operations
  selectDirectory: () => {
    return ipcRenderer.invoke('dialog-select-directory');
  },
  
  // Auto-updater
  checkForUpdates: () => {
    return ipcRenderer.invoke('app-check-for-updates');
  },
  restartAndInstall: () => {
    return ipcRenderer.invoke('app-restart-and-install');
  },
  onUpdateChecking: (callback) => {
    ipcRenderer.on('update-checking', callback);
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (_event, info) => callback(info));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (_event, message) => callback(message));
  },
  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
  },
  
  // Utility functions
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 
