import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { GitService } from '../lib/git/GitService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 600,
    minWidth: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready-to-show
  });

  // Load the index.html of the app.
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  createWindow();
  
  // Set application menu
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Repository...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-open-repository');
            }
          }
        },
        {
          label: 'Close Repository',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-close-repository');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Linear View',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-view-linear');
            }
          }
        },
        {
          label: 'Tree View',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-view-tree');
            }
          }
        },
        {
          label: 'Timeline View',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-view-timeline');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Register IPC handlers
  ipcMain.handle('dialog-select-directory', async () => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Git Repository',
      message: 'Choose a directory containing a Git repository'
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Git service IPC handlers
  ipcMain.handle('git-validate-repository', async (_event, repoPath: string) => {
    try {
      return await GitService.validateRepository(repoPath);
    } catch (error) {
      console.error('Error validating repository:', error);
      return false;
    }
  });

  ipcMain.handle('git-open-repository', async (_event, repoPath: string) => {
    try {
      return await GitService.openRepository(repoPath);
    } catch (error) {
      console.error('Error opening repository:', error);
      throw error;
    }
  });

  ipcMain.handle('git-get-commits', async (_event, repoPath: string, options?: { maxCount?: number }) => {
    try {
      return await GitService.getCommits(repoPath, options);
    } catch (error) {
      console.error('Error getting commits:', error);
      throw error;
    }
  });

  // Legacy handler for backward compatibility
  ipcMain.handle('git-get-commit-history', async (_event, repoPath: string) => {
    try {
      return await GitService.getCommits(repoPath, { maxCount: 100 });
    } catch (error) {
      console.error('Error getting commit history:', error);
      throw error;
    }
  });

  ipcMain.handle('git-edit-commit', async (_event, repoPath: string, commitHash: string, changes: Record<string, unknown>) => {
    try {
      // TODO: Implement commit editing functionality
      console.log('Edit commit requested:', { repoPath, commitHash, changes });
      return false; // Not implemented yet
    } catch (error) {
      console.error('Error editing commit:', error);
      throw error;
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});


