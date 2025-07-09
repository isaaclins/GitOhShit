import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ViewMode, AppMode, GitRepository, GitCommit } from '../types';

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
  commits: [],
  selectedCommits: [], // Keep for backward compatibility but will use selectedCommit for single selection
  selectedCommit: null, // New single selection field
  currentView: 'linear',
  mode: 'beginner',
  isLoading: false,
  error: null,
  undoStack: [],
  redoStack: [],
  selectedBranch: null,
  availableBranches: [],
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
