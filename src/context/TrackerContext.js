import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';

const TrackerContext = createContext(null);
const STORAGE_KEY = 'tpl_tracker_data';

// Guards against older saved shapes (e.g. pre-login/pre-user data)
// so a stale localStorage payload never crashes a render.
function normalizeProgress(raw) {
  return {
    token: raw?.token ?? '',
    user: raw?.user ?? null,
    completed: Array.isArray(raw?.completed) ? raw.completed : [],
  };
}

export const TrackerProvider = ({ children }) => {
  const [progress, setProgress] = useState({ token: '', user: null, completed: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load tracking data from localStorage on mount
    const saved = getLocalStorageItem(STORAGE_KEY);
    if (saved) {
      setProgress(normalizeProgress(saved));
    }
    setIsLoaded(true);
  }, []);

  const persist = (updated) => {
    setProgress(updated);
    setLocalStorageItem(STORAGE_KEY, updated);
  };

  const toggleLesson = (id, title) => {
    const exists = progress.completed.some((entry) =>
      typeof entry === 'string' ? entry === id : entry.id === id
    );
    const completed = exists
      ? progress.completed.filter((entry) =>
          typeof entry === 'string' ? entry !== id : entry.id !== id
        )
      : [...progress.completed, { id, title: title ?? null, completedAt: new Date().toISOString() }];
    persist({ ...progress, completed });
  };

  // Called once a PAT has been verified against the GitHub API.
  const login = (token, user) => {
    persist({ ...progress, token, user });
  };

  const logout = () => {
    persist({ ...progress, token: '', user: null });
  };

  // Kept so any existing callers of saveToken keep working.
  const saveToken = (token) => {
    persist({ ...progress, token });
  };

  // Used by the "Upload my data" flow to replace the completed-lessons list
  // (already merged with what's currently stored) in one persisted write.
  const importCompleted = (completed) => {
    persist({ ...progress, completed });
  };

  return (
    <TrackerContext.Provider
      value={{ progress, isLoaded, toggleLesson, saveToken, login, logout, importCompleted }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => useContext(TrackerContext);
