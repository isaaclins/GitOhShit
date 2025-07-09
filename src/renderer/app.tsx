import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface AppState {
  currentRepository: string | null;
  viewMode: 'linear' | 'tree' | 'timeline';
  isAdvancedMode: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentRepository: null,
    viewMode: 'linear',
    isAdvancedMode: false,
  });

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
        setAppState(prev => ({ ...prev, viewMode: 'linear' }));
      });

      window.electronAPI.onMenuViewTree(() => {
        setAppState(prev => ({ ...prev, viewMode: 'tree' }));
      });

      window.electronAPI.onMenuViewTimeline(() => {
        setAppState(prev => ({ ...prev, viewMode: 'timeline' }));
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

  const handleOpenRepository = async () => {
    try {
      const selectedPath = await window.electronAPI.selectDirectory();
      if (selectedPath) {
        setAppState(prev => ({ ...prev, currentRepository: selectedPath }));
      }
    } catch (error) {
      console.error('Failed to open repository:', error);
    }
  };

  const handleCloseRepository = () => {
    setAppState(prev => ({ ...prev, currentRepository: null }));
  };

  const toggleAdvancedMode = () => {
    setAppState(prev => ({ ...prev, isAdvancedMode: !prev.isAdvancedMode }));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Git-O-Shit</h1>
        <div style={styles.headerControls}>
          <button 
            style={styles.modeToggle} 
            onClick={toggleAdvancedMode}
          >
            {appState.isAdvancedMode ? 'Beginner Mode' : 'Advanced Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {appState.currentRepository ? (
          <div style={styles.repositoryView}>
            <div style={styles.repositoryInfo}>
              <h2 style={styles.repositoryPath}>{appState.currentRepository}</h2>
              <div style={styles.viewModeSelector}>
                <button
                  style={{
                    ...styles.viewButton,
                    ...(appState.viewMode === 'linear' ? styles.viewButtonActive : {})
                  }}
                  onClick={() => setAppState(prev => ({ ...prev, viewMode: 'linear' }))}
                >
                  Linear
                </button>
                <button
                  style={{
                    ...styles.viewButton,
                    ...(appState.viewMode === 'tree' ? styles.viewButtonActive : {})
                  }}
                  onClick={() => setAppState(prev => ({ ...prev, viewMode: 'tree' }))}
                >
                  Tree
                </button>
                <button
                  style={{
                    ...styles.viewButton,
                    ...(appState.viewMode === 'timeline' ? styles.viewButtonActive : {})
                  }}
                  onClick={() => setAppState(prev => ({ ...prev, viewMode: 'timeline' }))}
                >
                  Timeline
                </button>
              </div>
            </div>
            
            <div style={styles.gitVisualization}>
              <div style={styles.placeholder}>
                <h3>Git Visualization - {appState.viewMode} view</h3>
                <p>Repository visualization will be implemented here.</p>
                <p>Mode: {appState.isAdvancedMode ? 'Advanced' : 'Beginner'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.welcomeView}>
            <div style={styles.welcomeContent}>
              <h2 style={styles.welcomeTitle}>Welcome to Git-O-Shit</h2>
              <p style={styles.welcomeDescription}>
                A visual Git history editor that helps you fix your git mistakes.
              </p>
              <button style={styles.openButton} onClick={handleOpenRepository}>
                Open Repository
              </button>
              <p style={styles.helpText}>
                Or use Cmd+O (Ctrl+O on Windows/Linux) to open a repository
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
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
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repositoryPath: {
    margin: 0,
    fontSize: '16px',
    color: '#cccccc',
  },
  viewModeSelector: {
    display: 'flex',
    gap: '8px',
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
  gitVisualization: {
    flex: 1,
    padding: '20px',
  },
  placeholder: {
    textAlign: 'center' as const,
    marginTop: '100px',
  },
};

export default App;

// Mount the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} 
