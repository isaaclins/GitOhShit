import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ViewMode, AppMode, GitRepository, GitCommit } from '../types';

// ===================
// Action Types
// ===================

type AppAction = 
  | { type: 'SET_REPOSITORY'; payload: GitRepository }
  | { type: 'CLOSE_REPOSITORY' }
  | { type: 'SET_COMMITS'; payload: GitCommit[] }
  | { type: 'SET_SELECTED_COMMITS'; payload: string[] }
  | { type: 'ADD_SELECTED_COMMIT'; payload: string }
  | { type: 'REMOVE_SELECTED_COMMIT'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// ===================
// Initial State
// ===================

const initialState: AppState = {
  repository: null,
  commits: [],
  selectedCommits: [],
  currentView: 'linear',
  mode: 'beginner',
  isLoading: false,
  error: null,
  undoStack: [],
  redoStack: [],
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
        error: null,
      };

    case 'SET_COMMITS':
      return {
        ...state,
        commits: action.payload,
        selectedCommits: [], // Clear selection when commits change
      };

    case 'SET_SELECTED_COMMITS':
      return {
        ...state,
        selectedCommits: action.payload,
      };

    case 'ADD_SELECTED_COMMIT':
      if (state.selectedCommits.includes(action.payload)) {
        return state; // Already selected
      }
      return {
        ...state,
        selectedCommits: [...state.selectedCommits, action.payload],
      };

    case 'REMOVE_SELECTED_COMMIT':
      return {
        ...state,
        selectedCommits: state.selectedCommits.filter(hash => hash !== action.payload),
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedCommits: [],
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
    selectCommit: (hash: string, multi?: boolean) => void;
    clearSelection: () => void;
    setViewMode: (mode: ViewMode) => void;
    setAppMode: (mode: AppMode) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetState: () => void;
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

    selectCommit: (hash: string, multi = false) => {
      if (multi) {
        if (state.selectedCommits.includes(hash)) {
          dispatch({ type: 'REMOVE_SELECTED_COMMIT', payload: hash });
        } else {
          dispatch({ type: 'ADD_SELECTED_COMMIT', payload: hash });
        }
      } else {
        dispatch({ type: 'SET_SELECTED_COMMITS', payload: [hash] });
      }
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
