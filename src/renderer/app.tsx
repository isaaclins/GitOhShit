import React, { useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppStateProvider } from '../contexts/AppStateContext';
import CommitTabList from '../components/CommitTabList/CommitTabList';
import CommitMetadataPanel from '../components/CommitMetadataPanel/CommitMetadataPanel';
import { useAppState } from '../contexts/AppStateContext';
import { GitCommit } from '../types';
import './app.css';

const AppContent: React.FC = () => {
  const { state, actions } = useAppState();

  // Find the selected commit object
  const selectedCommitObj = state.selectedCommit 
    ? state.commits.find((c: GitCommit) => c.hash === state.selectedCommit) || null 
    : null;

  const handleCommitSelect = (commitHash: string) => {
    actions.selectCommit(commitHash);
  };

  const handleOpenRepository = useCallback(async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const path = await window.electronAPI.selectDirectory();
      if (!path) {
        actions.setLoading(false);
        return;
      }

      // Validate the selected directory is a git repository
      const isValid = await window.electronAPI.validateRepository(path);
      if (!isValid) {
        actions.setError('Selected directory is not a valid Git repository');
        actions.setLoading(false);
        return;
      }

      // Open the repository and get its information
      const repository = await window.electronAPI.openRepository(path);
      actions.setRepository(repository);

      // Load commit history
      const commitsResult = await window.electronAPI.getCommits(path, {
        maxCount: 100,
      });
      
      // Extract commits from the result (GitService returns { commits, hasMore, total })
      const commits = Array.isArray(commitsResult) ? commitsResult : (commitsResult as { commits?: GitCommit[] })?.commits || [];
      actions.setCommits(commits);

      // Set available branches from repository
      if (repository.branches && Array.isArray(repository.branches)) {
        const branchNames = repository.branches.map((branch: { name: string }) => branch.name);
        actions.setAvailableBranches(branchNames);
      }

      actions.setLoading(false);
    } catch (error) {
      console.error('Error opening repository:', error);
      actions.setError(
        `Failed to open repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      actions.setLoading(false);
    }
  }, [actions]);

  const handleCloseRepository = useCallback(() => {
    actions.closeRepository();
  }, [actions]);

  useEffect(() => {
    // Set up menu event listeners
    if (window.electronAPI) {
      window.electronAPI.onMenuOpenRepository(() => {
        handleOpenRepository();
      });

      window.electronAPI.onMenuCloseRepository(() => {
        handleCloseRepository();
      });

      window.electronAPI.onMenuViewLinear(() => {
        actions.setViewMode('linear');
      });

      window.electronAPI.onMenuViewTree(() => {
        actions.setViewMode('tree');
      });

      window.electronAPI.onMenuViewTimeline(() => {
        actions.setViewMode('timeline');
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-open-repository');
        window.electronAPI.removeAllListeners('menu-close-repository');
        window.electronAPI.removeAllListeners('menu-view-linear');
        window.electronAPI.removeAllListeners('menu-view-tree');
        window.electronAPI.removeAllListeners('menu-view-timeline');
      }
    };
  }, [actions, handleCloseRepository, handleOpenRepository]);

  return (
    <div className="app-main-content">
      {/* Header with title and repository info */}
      <div className="app-header">
        <div className="app-header-main">
          <h1 className="app-title">Git-O-Shit</h1>
          {state.repository ? (
            <div className="app-repo-info">
              <span className="app-repo-name">{state.repository.name}</span>
              <span className="app-repo-branch">📍 {state.repository.currentBranch}</span>
              <span className="app-repo-commits">📝 {state.commits.length} commits</span>
            </div>
          ) : (
            <span className="app-view-label">
              {state.currentView === 'linear' && 'Linear View'}
              {state.currentView === 'tree' && 'Tree View'}
              {state.currentView === 'timeline' && 'Timeline View'}
              {state.currentView === 'tabs' && 'Commit Browser'}
            </span>
          )}
        </div>

        <div className="app-header-actions">
          {state.repository ? (
            <>
              {selectedCommitObj && (
                <div className="app-selected-commit">
                  <span className="app-selected-commit-label">Selected:</span>
                  <span className="app-selected-commit-hash">
                    {selectedCommitObj.hash.substring(0, 8)}
                  </span>
                  <span className="app-selected-commit-message">
                    {selectedCommitObj.message.split('\n')[0].substring(0, 40)}
                    {selectedCommitObj.message.split('\n')[0].length > 40 ? '...' : ''}
                  </span>
                </div>
              )}
              <button 
                className="app-action-button app-action-button--secondary"
                onClick={handleCloseRepository}
                title="Close Repository"
              >
                ✕ Close
              </button>
            </>
          ) : (
            <button 
              className="app-action-button app-action-button--primary"
              onClick={handleOpenRepository}
              disabled={state.isLoading}
            >
              {state.isLoading ? '⏳ Loading...' : '📁 Open Repository'}
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="app-error-banner">
          <span>⚠️ {state.error}</span>
          <button
            className="app-error-close"
            onClick={() => actions.setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="app-content-container">
        {!state.repository ? (
          <div className="app-welcome">
            <div className="app-welcome-content">
              <h2>Welcome to Git-O-Shit</h2>
              <p>A visual Git history browser that helps you understand your repository.</p>
              <button
                className="app-welcome-button"
                onClick={handleOpenRepository}
                disabled={state.isLoading}
              >
                {state.isLoading ? '⏳ Loading Repository...' : '📁 Open Git Repository'}
              </button>
              <p className="app-welcome-hint">
                Or use Cmd+O (Ctrl+O on Windows/Linux) to open a repository
              </p>
            </div>
          </div>
        ) : state.currentView === 'tabs' ? (
          <div className="app-tab-layout">
            {/* Left panel - Commit tabs */}
            <div className="app-tab-left-panel">
              <CommitTabList 
                commits={state.commits}
                selectedCommit={state.selectedCommit}
                onCommitSelect={handleCommitSelect}
                branchFilter={state.selectedBranch}
              />
            </div>

            {/* Right panel - Commit metadata */}
            <div className="app-tab-right-panel">
              <CommitMetadataPanel commit={selectedCommitObj} />
            </div>
          </div>
        ) : (
          <div className="app-graph-container">
            <div className="app-graph-placeholder">
              <h2>Graph View Coming Soon</h2>
              <p>This view is currently under development. Please use the Commit Browser (tabs) view.</p>
              <button
                className="app-action-button app-action-button--primary"
                onClick={() => actions.setViewMode('tabs')}
              >
                Switch to Commit Browser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default App;

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
