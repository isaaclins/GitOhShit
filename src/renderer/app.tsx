import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppStateProvider, useAppState } from '../contexts/AppStateContext';
import { GitCommit, GitBranch } from '../types';
import CommitTabList from '../components/CommitTabList/CommitTabList';
import CommitMetadataPanel from '../components/CommitMetadataPanel/CommitMetadataPanel';

const AppContent: React.FC = () => {
  const { state, actions } = useAppState();

  const handleOpenRepository = async () => {
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
      const commits = await window.electronAPI.getCommits(path, {
        maxCount: 50,
      });
      actions.setCommits(commits);

      // Extract available branches from commits and repository
      const branchesFromCommits = new Set<string>();
      if (commits && Array.isArray(commits)) {
        commits.forEach((commit: GitCommit) => {
          if (commit.branches && Array.isArray(commit.branches)) {
            commit.branches.forEach((branch: string) => branchesFromCommits.add(branch));
          }
        });
      }
      
      // Add branches from repository info
      if (repository.branches && Array.isArray(repository.branches)) {
        repository.branches.forEach((branch: GitBranch) => branchesFromCommits.add(branch.name));
      }
      
      // Convert to array and set available branches
      const availableBranches = Array.from(branchesFromCommits).sort();
      actions.setAvailableBranches(availableBranches);
      
      // Set current branch as selected if it exists in available branches
      if (availableBranches.includes(repository.currentBranch)) {
        actions.setSelectedBranch(repository.currentBranch);
      }

      actions.setLoading(false);
    } catch (error) {
      console.error('Error opening repository:', error);
      actions.setError(
        `Failed to open repository: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      actions.setLoading(false);
    }
  };

  const handleCloseRepository = () => {
    actions.closeRepository();
  };

  const toggleMode = () => {
    actions.setAppMode(state.mode === 'beginner' ? 'advanced' : 'beginner');
  };

  const toggleView = (view: 'linear' | 'tree' | 'timeline') => {
    actions.setViewMode(view);
  };

  const handleCommitSelect = (commitHash: string) => {
    actions.selectCommit(commitHash);
  };

  const handleCommitHover = (commitHash: string | null) => {
    // TODO: implement hover highlighting in future updates
    console.log('Hovering commit:', commitHash);
  };

  // Get the selected commit object for the metadata panel
  const selectedCommitObject = state.selectedCommit 
    ? state.commits.find(commit => commit.hash === state.selectedCommit) || null
    : null;

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
        toggleView('linear');
      });

      window.electronAPI.onMenuViewTree(() => {
        toggleView('tree');
      });

      window.electronAPI.onMenuViewTimeline(() => {
        toggleView('timeline');
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
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Git-O-Shit</h1>
          <span style={styles.subtitle}>
            A visual Git history editor that helps you fix your git mistakes
          </span>
        </div>

        <div style={styles.headerControls}>
          <button style={styles.modeToggle} onClick={toggleMode}>
            {state.mode === 'beginner' ? 'Advanced Mode' : 'Beginner Mode'}
          </button>

          {state.repository && (
            <div style={styles.viewControls}>
              <button
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'linear'
                    ? styles.viewButtonActive
                    : {}),
                }}
                onClick={() => toggleView('linear')}
              >
                Linear
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'tree'
                    ? styles.viewButtonActive
                    : {}),
                }}
                onClick={() => toggleView('tree')}
              >
                Tree
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'timeline'
                    ? styles.viewButtonActive
                    : {}),
                }}
                onClick={() => toggleView('timeline')}
              >
                Timeline
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {state.error && (
        <div style={styles.errorBanner}>
          <span>⚠️ {state.error}</span>
          <button
            style={styles.errorClose}
            onClick={() => actions.setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {!state.repository ? (
          <div style={styles.welcomeView}>
            <div style={styles.welcomeContent}>
              <h2 style={styles.welcomeTitle}>Welcome to Git-O-Shit</h2>
              <p style={styles.welcomeDescription}>
                A visual Git history editor that helps you fix your git
                mistakes.
              </p>
              <button
                style={{
                  ...styles.openButton,
                  ...(state.isLoading ? styles.openButtonLoading : {}),
                }}
                onClick={handleOpenRepository}
                disabled={state.isLoading}
              >
                {state.isLoading
                  ? 'Loading Git Repository...'
                  : 'Open Repository'}
              </button>
              <p style={styles.helpText}>
                Or use Cmd+O (Ctrl+O on Windows/Linux) to open a repository
              </p>
            </div>
          </div>
        ) : (
          <div style={styles.repositoryView}>
            {/* Repository Info Header */}
            <div style={styles.repositoryInfo}>
              <div style={styles.repoHeader}>
                <h3 style={styles.repoName}>{state.repository.name}</h3>
                <button
                  style={styles.closeRepoButton}
                  onClick={handleCloseRepository}
                  title="Close Repository"
                >
                  ✕
                </button>
              </div>

              <div style={styles.repoDetails}>
                <span style={styles.repoPath}>{state.repository.path}</span>
                <span style={styles.repoBranch}>
                  📍 {state.repository.currentBranch}
                </span>
                <span style={styles.repoCommits}>
                  📝 {state.commits.length} commits loaded
                </span>
                {state.selectedCommit && (
                  <span style={styles.selectedCommitInfo}>
                    👆 Selected: {state.selectedCommit.substring(0, 7)}
                  </span>
                )}
              </div>

              {/* Branch Filter Selector */}
              <div style={styles.branchFilter}>
                <label style={styles.branchFilterLabel}>
                  Filter by branch:
                </label>
                <select 
                  style={styles.branchFilterSelect}
                  value={state.selectedBranch || ''}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    actions.setSelectedBranch(value);
                  }}
                >
                  <option value="">All branches</option>
                  {state.repository.branches && state.repository.branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name} {branch.current ? '(current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {state.repository.status && (
                <div style={styles.repoStatus}>
                  {state.repository.status.ahead > 0 && (
                    <span style={styles.statusAhead}>
                      ↑{state.repository.status.ahead}
                    </span>
                  )}
                  {state.repository.status.behind > 0 && (
                    <span style={styles.statusBehind}>
                      ↓{state.repository.status.behind}
                    </span>
                  )}
                  {state.repository.status.modified.length > 0 && (
                    <span style={styles.statusModified}>
                      M{state.repository.status.modified.length}
                    </span>
                  )}
                  {state.repository.status.staged.length > 0 && (
                    <span style={styles.statusStaged}>
                      S{state.repository.status.staged.length}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Vertical Tab Interface */}
            <div style={styles.tabInterface}>
              {state.isLoading ? (
                <div style={styles.loadingCommits}>
                  <p>Loading commit history...</p>
                </div>
              ) : (
                <>
                  {/* Left Panel - Commit Tab List */}
                  <div style={styles.leftPanel}>
                    <CommitTabList
                      commits={state.commits}
                      selectedCommit={state.selectedCommit}
                      onCommitSelect={handleCommitSelect}
                      branchFilter={state.selectedBranch}
                    />
                  </div>

                  {/* Right Panel - Commit Metadata */}
                  <div style={styles.rightPanel}>
                    <CommitMetadataPanel
                      commit={selectedCommitObject}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
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

// Styles
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  },
  header: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #3e3e3e',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '12px',
    color: '#888888',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modeToggle: {
    padding: '8px 16px',
    backgroundColor: '#007acc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  viewControls: {
    display: 'flex',
    gap: '4px',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#3e3e3e',
    color: '#cccccc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  viewButtonActive: {
    backgroundColor: '#007acc',
    color: '#ffffff',
  },
  errorBanner: {
    padding: '12px 20px',
    backgroundColor: '#721c24',
    color: '#f85149',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #8b252c',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    color: '#f85149',
    cursor: 'pointer',
    fontSize: '16px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  welcomeView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContent: {
    textAlign: 'center' as const,
    maxWidth: '500px',
    padding: '40px',
  },
  welcomeTitle: {
    fontSize: '32px',
    marginBottom: '16px',
    color: '#ffffff',
  },
  welcomeDescription: {
    fontSize: '18px',
    marginBottom: '32px',
    color: '#cccccc',
    lineHeight: '1.5',
  },
  openButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#007acc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  openButtonLoading: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
  },
  helpText: {
    fontSize: '14px',
    color: '#888888',
  },
  repositoryView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  repositoryInfo: {
    padding: '16px 20px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #3e3e3e',
  },
  repoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  repoName: {
    margin: 0,
    fontSize: '18px',
    color: '#ffffff',
  },
  closeRepoButton: {
    background: 'none',
    border: 'none',
    color: '#888888',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  repoDetails: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    fontSize: '14px',
    marginBottom: '8px',
  },
  repoPath: {
    color: '#888888',
  },
  repoBranch: {
    color: '#58a6ff',
  },
  repoCommits: {
    color: '#7fb069',
  },
  selectedCommitInfo: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  repoStatus: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
  },
  statusAhead: {
    padding: '2px 6px',
    backgroundColor: '#2ea043',
    borderRadius: '2px',
  },
  statusBehind: {
    padding: '2px 6px',
    backgroundColor: '#da3633',
    borderRadius: '2px',
  },
  statusModified: {
    padding: '2px 6px',
    backgroundColor: '#fb8500',
    borderRadius: '2px',
  },
  statusStaged: {
    padding: '2px 6px',
    backgroundColor: '#58a6ff',
    borderRadius: '2px',
  },
  tabInterface: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '380px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  loadingCommits: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888888',
  },
  branchFilter: {
    marginTop: '16px',
    marginBottom: '8px',
  },
  branchFilterLabel: {
    fontSize: '14px',
    color: '#888888',
    marginRight: '8px',
  },
  branchFilterSelect: {
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#3e3e3e',
    color: '#ffffff',
    border: '1px solid #555555',
    fontSize: '14px',
  },
};

export default App;

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
