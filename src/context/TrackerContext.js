import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';
import { verifyGitHubToken } from '../utils/github';
import { pushProgressToGist } from '../utils/githubSync';
import { buildExportPayload } from '../utils/dataTransfer';

const TrackerContext = createContext(null);
const STORAGE_KEY = 'tpl_tracker_data';
const SYNC_DEBOUNCE_MS = 1500;

/**
 * @typedef {'local' | 'github'} AuthMode
 * @typedef {Object} UserSession
 * @property {string} username
 * @property {AuthMode} authMode
 * @property {string} [pat] - present only when authMode === 'github'
 * @property {string|null} [avatarUrl]
 * @property {Object|null} [githubProfile] - raw GitHub /user response, kept
 *   around so /profile can show name/html_url without an extra fetch
 * @property {string|null} [gistId] - id of the backup gist, once one exists
 */

// Normalizes a session read from localStorage into the current
// UserSession shape, so an older/partial saved payload never crashes a
// render.
function normalizeSession(raw) {
  if (!raw || (raw.authMode !== 'local' && raw.authMode !== 'github')) return null;
  return {
    username: raw.username ?? '',
    authMode: raw.authMode,
    pat: raw.authMode === 'github' ? raw.pat ?? '' : undefined,
    avatarUrl: raw.avatarUrl ?? null,
    githubProfile: raw.githubProfile ?? null,
    gistId: raw.gistId ?? null,
  };
}

// Pre-refactor localStorage shape was flat: { token, user, completed }.
// Anyone who connected GitHub before this change still has that sitting
// in their browser — read it into the new session shape instead of
// treating it as "logged out".
function migrateLegacyFlatSession(raw) {
  if (!raw?.token) return null;
  return {
    username: raw.user?.login ?? 'GitHub User',
    authMode: 'github',
    pat: raw.token,
    avatarUrl: raw.user?.avatar_url ?? null,
    githubProfile: raw.user ?? null,
    gistId: null,
  };
}

function normalizeProgress(raw) {
  const session = raw?.session !== undefined ? normalizeSession(raw.session) : migrateLegacyFlatSession(raw);
  return {
    session,
    completed: Array.isArray(raw?.completed) ? raw.completed : [],
  };
}

export const TrackerProvider = ({ children }) => {
  const [progress, setProgress] = useState({ session: null, completed: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  // 'idle' | 'syncing' | 'synced' | 'error' — status of the background
  // GitHub gist backup, independent from the localStorage save above
  // (which always succeeds locally regardless of this).
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Mirrors `progress` so async callbacks (debounced sync, gist push
  // responses) always act on the latest data instead of a stale
  // snapshot captured when they were scheduled.
  const progressRef = useRef(progress);
  const syncTimerRef = useRef(null);

  useEffect(() => {
    const saved = getLocalStorageItem(STORAGE_KEY);
    if (saved) {
      const normalized = normalizeProgress(saved);
      progressRef.current = normalized;
      setProgress(normalized);
    }
    setIsLoaded(true);
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // The single place that writes to localStorage. Always runs — this is
  // the "localStorage is the source of truth" guarantee — and never by
  // itself talks to the network.
  const persist = (updated) => {
    progressRef.current = updated;
    setProgress(updated);
    setLocalStorageItem(STORAGE_KEY, updated);
  };

  // Pushes whatever is currently in progressRef to the backup gist, if
  // this is a github-mode session with a token. No-ops otherwise, so
  // it's always safe to call speculatively.
  const runSync = async () => {
    const current = progressRef.current;
    const session = current.session;
    if (session?.authMode !== 'github' || !session.pat) return;

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const payload = buildExportPayload(current);
      const newGistId = await pushProgressToGist(session.pat, payload, session.gistId);
      // Re-read progressRef here rather than closing over `session`,
      // in case something else changed while the request was in flight.
      const latest = progressRef.current;
      if (latest.session && latest.session.gistId !== newGistId) {
        persist({ ...latest, session: { ...latest.session, gistId: newGistId } });
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error.message || 'GitHub sync failed.');
    }
  };

  const scheduleSync = () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(runSync, SYNC_DEBOUNCE_MS);
  };

  // Persists a progress update and, if it belongs to a github-mode
  // session, schedules a debounced background sync — this is the
  // "always write locally; sync only when authMode === 'github' and a
  // PAT exists" condition check from the storage pipeline.
  const persistAndMaybeSync = (updated) => {
    persist(updated);
    if (updated.session?.authMode === 'github' && updated.session?.pat) {
      scheduleSync();
    }
  };

  const toggleLesson = (id, title) => {
    const current = progressRef.current;
    const exists = current.completed.some((entry) =>
      typeof entry === 'string' ? entry === id : entry.id === id
    );
    const completed = exists
      ? current.completed.filter((entry) => (typeof entry === 'string' ? entry !== id : entry.id !== id))
      : [...current.completed, { id, title: title ?? null, completedAt: new Date().toISOString() }];
    persistAndMaybeSync({ ...current, completed });
  };

  // Quick Start: no network call, no validation beyond "non-empty".
  const loginLocal = (username) => {
    const trimmed = (username ?? '').trim();
    if (!trimmed) throw new Error('Please enter a username.');
    const session = { username: trimmed, authMode: 'local', avatarUrl: null, gistId: null };
    persist({ ...progressRef.current, session });
    return session;
  };

  // Sync with GitHub: verifies the PAT against the GitHub API, then logs
  // in. Any existing local progress is kept as-is; a background push to
  // the backup gist is kicked off but not awaited, since the login
  // itself shouldn't be gated on the network round trip to Gists.
  const loginGithub = async (pat) => {
    const trimmedPat = (pat ?? '').trim();
    if (!trimmedPat) throw new Error('Please paste a token first.');
    const user = await verifyGitHubToken(trimmedPat);
    const session = {
      username: user.login,
      authMode: 'github',
      pat: trimmedPat,
      avatarUrl: user.avatar_url ?? null,
      githubProfile: user,
      gistId: null,
    };
    persist({ ...progressRef.current, session });
    runSync(); // background — not awaited
    return user;
  };

  // Upgrade path: converts a local session to a github session in
  // place, then uploads the existing local progress right away (and
  // this one IS awaited, so the settings UI can show a real
  // success/failure state instead of a silent background job).
  const upgradeToGithub = async (pat) => {
    if (progressRef.current.session?.authMode !== 'local') {
      throw new Error('Only a local account can be upgraded to GitHub sync.');
    }
    const trimmedPat = (pat ?? '').trim();
    if (!trimmedPat) throw new Error('Please paste a token first.');
    const user = await verifyGitHubToken(trimmedPat);
    const session = {
      username: user.login,
      authMode: 'github',
      pat: trimmedPat,
      avatarUrl: user.avatar_url ?? null,
      githubProfile: user,
      gistId: null,
    };
    persist({ ...progressRef.current, session });
    await runSync();
    return user;
  };

  // Clears the session only — completed lessons stay put unless the
  // caller explicitly asks to wipe them too (e.g. a future "forget me"
  // action; nothing in the current UI does this).
  const logout = ({ wipeProgress = false } = {}) => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    setSyncStatus('idle');
    setSyncError(null);
    const current = progressRef.current;
    persist({ session: null, completed: wipeProgress ? [] : current.completed });
  };

  // Lets the UI retry a failed background sync without the person
  // needing to touch a lesson checkbox first.
  const retrySync = () => {
    runSync();
  };

  // Used by the "Upload my data" flow to replace the completed-lessons
  // list (already merged with what's currently stored) in one
  // persisted write.
  const importCompleted = (completed) => {
    persistAndMaybeSync({ ...progressRef.current, completed });
  };

  return (
    <TrackerContext.Provider
      value={{
        progress,
        isLoaded,
        toggleLesson,
        loginLocal,
        loginGithub,
        upgradeToGithub,
        logout,
        importCompleted,
        syncStatus,
        syncError,
        lastSyncedAt,
        retrySync,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => useContext(TrackerContext);
