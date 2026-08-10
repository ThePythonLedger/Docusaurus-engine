import React, { useState } from 'react';
import styles from './styles.module.css';
import { useTracker } from '../../context/TrackerContext';
import GitHubPatForm from '../GitHubPatForm';

export default function LoginModal({ isOpen, onClose }) {
  const { loginLocal, loginGithub } = useTracker();
  const [activeTab, setActiveTab] = useState('local');
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState(null);

  if (!isOpen) return null;

  const handleLocalSubmit = (event) => {
    event.preventDefault();
    try {
      loginLocal(username);
      setLocalError(null);
      onClose();
    } catch (error) {
      setLocalError(error.message);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          &times;
        </button>

        <header className={styles.modalHeader}>
          <h2>Get Started with The Python Ledger</h2>
        </header>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'local'}
            className={`${styles.tab} ${activeTab === 'local' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('local')}
          >
            Quick Start
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'github'}
            className={`${styles.tab} ${activeTab === 'github' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('github')}
          >
            Sync with GitHub
          </button>
        </div>

        {activeTab === 'local' && (
          <form className={styles.localForm} onSubmit={handleLocalSubmit}>
            <p className={styles.tabIntro}>
              Pick a display name and start learning right away. Your progress is saved in this browser —
              no account needed. You can connect GitHub for cloud sync later from your profile.
            </p>
            <label htmlFor="usernameInput">Username</label>
            <input
              id="usernameInput"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pythonista42"
              autoFocus
            />
            {localError && <div className={`${styles.statusMessage} ${styles.error}`}>{localError}</div>}
            <button type="submit" className={styles.primaryButton}>
              Start Learning
            </button>
          </form>
        )}

        {activeTab === 'github' && (
          <div>
            <p className={styles.tabIntro}>
              Connect a GitHub Personal Access Token to back your progress up to a private Gist and sync it
              across devices.
            </p>
            <GitHubPatForm onSubmit={loginGithub} onSuccess={() => setTimeout(onClose, 1200)} />
          </div>
        )}
      </div>
    </div>
  );
}
