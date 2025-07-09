import { contextBridge, ipcRenderer } from 'electron';

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
  openRepository: (path: string) => Promise<any>;
  getCommits: (path: string, options?: { maxCount?: number }) => Promise<any[]>;
  getCommitHistory: (repoPath: string) => Promise<any[]>;
  editCommit: (repoPath: string, commitHash: string, changes: any) => Promise<boolean>;
  
  // File system operations
  selectDirectory: () => Promise<string | null>;
  
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
  editCommit: (repoPath: string, commitHash: string, changes: any) => {
    return ipcRenderer.invoke('git-edit-commit', repoPath, commitHash, changes);
  },
  
  // File system operations
  selectDirectory: () => {
    return ipcRenderer.invoke('dialog-select-directory');
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
