import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppStateProvider, useAppState } from '../contexts/AppStateContext';
import { GitRepository, GitCommit } from '../types';

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
      const commits = await window.electronAPI.getCommits(path, { maxCount: 50 });
      actions.setCommits(commits);

      actions.setLoading(false);
    } catch (error) {
      console.error('Error opening repository:', error);
      actions.setError(`Failed to open repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <button 
            style={styles.modeToggle} 
            onClick={toggleMode}
          >
            {state.mode === 'beginner' ? 'Advanced Mode' : 'Beginner Mode'}
          </button>

          {state.repository && (
            <div style={styles.viewControls}>
              <button 
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'linear' ? styles.viewButtonActive : {})
                }}
                onClick={() => toggleView('linear')}
              >
                Linear
              </button>
              <button 
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'tree' ? styles.viewButtonActive : {})
                }}
                onClick={() => toggleView('tree')}
              >
                Tree
              </button>
              <button 
                style={{
                  ...styles.viewButton,
                  ...(state.currentView === 'timeline' ? styles.viewButtonActive : {})
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
                A visual Git history editor that helps you fix your git mistakes.
              </p>
              <button 
                style={{
                  ...styles.openButton,
                  ...(state.isLoading ? styles.openButtonLoading : {})
                }}
                onClick={handleOpenRepository}
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Loading Git Repository...' : 'Open Repository'}
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
              </div>

              {state.repository.status && (
                <div style={styles.repoStatus}>
                  {state.repository.status.ahead > 0 && (
                    <span style={styles.statusAhead}>↑{state.repository.status.ahead}</span>
                  )}
                  {state.repository.status.behind > 0 && (
                    <span style={styles.statusBehind}>↓{state.repository.status.behind}</span>
                  )}
                  {state.repository.status.modified.length > 0 && (
                    <span style={styles.statusModified}>M{state.repository.status.modified.length}</span>
                  )}
                  {state.repository.status.staged.length > 0 && (
                    <span style={styles.statusStaged}>S{state.repository.status.staged.length}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Git Visualization */}
            <div style={styles.gitVisualization}>
              <div style={styles.viewHeader}>
                <h4 style={styles.viewTitle}>Git History ({state.currentView} view)</h4>
                {state.selectedCommits.length > 0 && (
                  <span style={styles.selectionInfo}>
                    {state.selectedCommits.length} commit{state.selectedCommits.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              {state.isLoading ? (
                <div style={styles.loadingCommits}>
                  <p>Loading commit history...</p>
                </div>
              ) : (
                <div style={styles.commitsList}>
                  {state.commits.map((commit) => (
                    <div 
                      key={commit.hash}
                      style={{
                        ...styles.commitItem,
                        ...(state.selectedCommits.includes(commit.hash) ? styles.commitItemSelected : {})
                      }}
                      onClick={() => actions.selectCommit(commit.hash)}
                    >
                      <div style={styles.commitHash}>{commit.shortHash}</div>
                      <div style={styles.commitMessage}>{commit.summary}</div>
                      <div style={styles.commitAuthor}>
                        {commit.author.name} • {commit.author.date.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {state.commits.length === 0 && (
                    <p style={styles.noCommits}>No commits found in this repository.</p>
                  )}
                </div>
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
  gitVisualization: {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
  },
  viewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  viewTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#ffffff',
  },
  selectionInfo: {
    fontSize: '14px',
    color: '#888888',
  },
  loadingCommits: {
    textAlign: 'center' as const,
    marginTop: '100px',
    color: '#888888',
  },
  commitsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  commitItem: {
    padding: '12px',
    backgroundColor: '#3e3e3e',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
  },
  commitItemSelected: {
    borderColor: '#007acc',
    backgroundColor: '#1a365d',
  },
  commitHash: {
    fontSize: '12px',
    color: '#888888',
    fontFamily: 'monospace',
    marginBottom: '4px',
  },
  commitMessage: {
    fontSize: '14px',
    color: '#ffffff',
    marginBottom: '4px',
  },
  commitAuthor: {
    fontSize: '12px',
    color: '#888888',
  },
  noCommits: {
    textAlign: 'center' as const,
    marginTop: '50px',
    color: '#888888',
  },
};

export default App;

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} 
