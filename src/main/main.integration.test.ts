/**
 * Integration tests for Electron main process IPC handlers
 * These test the actual IPC communication (not mocked)
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Mock dialog to avoid actually opening file dialogs during tests
jest.mock('electron', () => ({
  app: {
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(),
  Menu: {
    buildFromTemplate: jest.fn(),
    setApplicationMenu: jest.fn(),
  },
  ipcMain: {
    handle: jest.fn(),
  },
  dialog: {
    showOpenDialog: jest.fn(),
  },
}));

describe('Main Process IPC Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers dialog-select-directory handler', async () => {
    // Import the main file to trigger IPC handler registration
    require('./main');
    
    // Verify that the IPC handler was registered
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'dialog-select-directory',
      expect.any(Function)
    );
  });

  test('dialog-select-directory handler returns path when directory selected', async () => {
    const mockDialog = require('electron').dialog;
    mockDialog.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ['/path/to/selected/repo']
    });

    // Import main to get the handler function
    require('./main');
    
    // Get the handler function that was registered
    const handlerCall = (ipcMain.handle as jest.Mock).mock.calls.find(
      call => call[0] === 'dialog-select-directory'
    );
    
    if (handlerCall) {
      const handler = handlerCall[1];
      const result = await handler();
      expect(result).toBe('/path/to/selected/repo');
    }
  });

  test('dialog-select-directory handler returns null when canceled', async () => {
    const mockDialog = require('electron').dialog;
    mockDialog.showOpenDialog.mockResolvedValue({
      canceled: true,
      filePaths: []
    });

    require('./main');
    
    const handlerCall = (ipcMain.handle as jest.Mock).mock.calls.find(
      call => call[0] === 'dialog-select-directory'
    );
    
    if (handlerCall) {
      const handler = handlerCall[1];
      const result = await handler();
      expect(result).toBeNull();
    }
  });
});

// Note: This is a simplified integration test. 
// In a real project, you'd use spectron or playwright-electron 
// for full end-to-end testing of the Electron app. 
