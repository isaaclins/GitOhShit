import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ViewMode, AppMode, GitRepository, GitCommit } from '../types';

// Mock commit data for initial display
const mockCommits: GitCommit[] = [
  {
    hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
    shortHash: 'a1b2c3d',
    author: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      date: new Date('2024-01-15T10:30:00Z'),
    },
    committer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      date: new Date('2024-01-15T10:30:00Z'),
    },
    message: 'Initial commit\n\nSet up project structure and basic configuration.',
    summary: 'Initial commit',
    body: 'Set up project structure and basic configuration.',
    parents: [],
    refs: ['HEAD', 'main'],
    tags: ['v1.0.0'],
    branches: ['main'],
  },
  {
    hash: 'b2c3d4e5f6789012345678901234567890abcdef',
    shortHash: 'b2c3d4e',
    author: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      date: new Date('2024-01-16T14:22:00Z'),
    },
    committer: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      date: new Date('2024-01-16T14:22:00Z'),
    },
    message: 'Add user authentication\n\nImplemented login and registration functionality with JWT tokens.',
    summary: 'Add user authentication',
    body: 'Implemented login and registration functionality with JWT tokens.',
    parents: ['a1b2c3d4e5f6789012345678901234567890abcd'],
    refs: [],
    tags: [],
    branches: ['main', 'feature/auth'],
  },
  {
    hash: 'c3d4e5f6789012345678901234567890abcdef12',
    shortHash: 'c3d4e5f',
    author: {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      date: new Date('2024-01-17T09:15:00Z'),
    },
    committer: {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      date: new Date('2024-01-17T09:15:00Z'),
    },
    message: 'Fix authentication bug\n\nResolved issue with token expiration handling.',
    summary: 'Fix authentication bug',
    body: 'Resolved issue with token expiration handling.',
    parents: ['b2c3d4e5f6789012345678901234567890abcdef'],
    refs: [],
    tags: [],
    branches: ['main'],
  },
  {
    hash: 'd4e5f6789012345678901234567890abcdef1234',
    shortHash: 'd4e5f67',
    author: {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      date: new Date('2024-01-18T16:45:00Z'),
    },
    committer: {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      date: new Date('2024-01-18T16:45:00Z'),
    },
    message: 'Merge feature/auth into main\n\nBrought authentication functionality into main branch.',
    summary: 'Merge feature/auth into main',
    body: 'Brought authentication functionality into main branch.',
    parents: ['c3d4e5f6789012345678901234567890abcdef12', 'b2c3d4e5f6789012345678901234567890abcdef'],
    refs: [],
    tags: ['v1.1.0'],
    branches: ['main'],
  },
  {
    hash: 'e5f6789012345678901234567890abcdef123456',
    shortHash: 'e5f6789',
    author: {
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      date: new Date('2024-01-19T11:20:00Z'),
    },
    committer: {
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      date: new Date('2024-01-19T11:20:00Z'),
    },
    message: 'Add database migrations\n\nCreated initial database schema and migration scripts.',
    summary: 'Add database migrations',
    body: 'Created initial database schema and migration scripts.',
    parents: ['d4e5f6789012345678901234567890abcdef1234'],
    refs: [],
    tags: [],
    branches: ['main', 'feature/database'],
  },
];

// ===================
// Action Types
// ===================

type AppAction =
  | { type: 'SET_REPOSITORY'; payload: GitRepository }
  | { type: 'CLOSE_REPOSITORY' }
  | { type: 'SET_COMMITS'; payload: GitCommit[] }
  | { type: 'SET_SELECTED_COMMIT'; payload: string | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' }
  | { type: 'SET_SELECTED_BRANCH'; payload: string | null }
  | { type: 'SET_AVAILABLE_BRANCHES'; payload: string[] };

// ===================
// Initial State
// ===================

const initialState: AppState = {
  repository: null,
  commits: mockCommits, // Start with mock data
  selectedCommits: [], // Keep for backward compatibility but will use selectedCommit for single selection
  selectedCommit: null, // New single selection field
  currentView: 'tabs', // Default to tabs view for the new interface
  mode: 'beginner',
  isLoading: false,
  error: null,
  undoStack: [],
  redoStack: [],
  selectedBranch: null,
  availableBranches: ['main', 'feature/auth', 'feature/database'],
};

// ===================
// Reducer
// ===================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REPOSITORY':
      return {
        ...state,
        repository: action.payload,
        error: null,
      };

    case 'CLOSE_REPOSITORY':
      return {
        ...state,
        repository: null,
        commits: [],
        selectedCommits: [],
        selectedCommit: null,
        error: null,
      };

    case 'SET_COMMITS':
      return {
        ...state,
        commits: action.payload,
        selectedCommits: [], // Clear selection when commits change
        selectedCommit: null,
      };

    case 'SET_SELECTED_COMMIT':
      return {
        ...state,
        selectedCommit: action.payload,
        selectedCommits: action.payload ? [action.payload] : [], // Maintain backward compatibility
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedCommits: [],
        selectedCommit: null,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        currentView: action.payload,
      };

    case 'SET_APP_MODE':
      return {
        ...state,
        mode: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'RESET_STATE':
      return initialState;

    case 'SET_SELECTED_BRANCH':
      return {
        ...state,
        selectedBranch: action.payload,
      };

    case 'SET_AVAILABLE_BRANCHES':
      return {
        ...state,
        availableBranches: action.payload,
      };

    default:
      return state;
  }
}

// ===================
// Context
// ===================

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setRepository: (repository: GitRepository) => void;
    closeRepository: () => void;
    setCommits: (commits: GitCommit[]) => void;
    selectCommit: (hash: string | null) => void;
    clearSelection: () => void;
    setViewMode: (mode: ViewMode) => void;
    setAppMode: (mode: AppMode) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetState: () => void;
    setSelectedBranch: (branch: string | null) => void;
    setAvailableBranches: (branches: string[]) => void;
  };
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// ===================
// Provider Component
// ===================

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setRepository: (repository: GitRepository) => {
      dispatch({ type: 'SET_REPOSITORY', payload: repository });
    },

    closeRepository: () => {
      dispatch({ type: 'CLOSE_REPOSITORY' });
    },

    setCommits: (commits: GitCommit[]) => {
      dispatch({ type: 'SET_COMMITS', payload: commits });
    },

    selectCommit: (hash: string | null) => {
      dispatch({ type: 'SET_SELECTED_COMMIT', payload: hash });
    },

    clearSelection: () => {
      dispatch({ type: 'CLEAR_SELECTION' });
    },

    setViewMode: (mode: ViewMode) => {
      dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    },

    setAppMode: (mode: AppMode) => {
      dispatch({ type: 'SET_APP_MODE', payload: mode });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    },

    setSelectedBranch: (branch: string | null) => {
      dispatch({ type: 'SET_SELECTED_BRANCH', payload: branch });
    },

    setAvailableBranches: (branches: string[]) => {
      dispatch({ type: 'SET_AVAILABLE_BRANCHES', payload: branches });
    },
  };

  return (
    <AppStateContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppStateContext.Provider>
  );
};

// ===================
// Hook
// ===================

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext; 
