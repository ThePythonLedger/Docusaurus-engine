import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import LoginModal from '../LoginModal';
import { useTracker } from '../../context/TrackerContext';

const GitHubMark = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    className={styles.icon}
    aria-hidden="true"
  >
    <path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82A7.44 7.44 0 0 0 8 3c-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88.01.47.01.84.01.93 0 .22-.16.47-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
  </svg>
);

// Generic person glyph for local-mode sessions, which have no avatar of
// their own.
const PersonIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    className={styles.icon}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 1.5c-3.03 0-6 1.5-6 3.75V15h12v-1.75c0-2.25-2.97-3.75-6-3.75Z"
    />
  </svg>
);

export default function GitHubConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { progress } = useTracker();
  const session = progress?.session;

  if (session?.authMode === 'github') {
    // Once connected, this doubles as the entry point to /profile —
    // it's the only nav element that links there.
    return (
      <Link to="/profile" className={`${styles.connectBtn} ${styles.connected}`}>
        {session.avatarUrl ? (
          <img src={session.avatarUrl} alt="" className={styles.avatar} />
        ) : (
          <GitHubMark />
        )}
        <span>{session.username}</span>
      </Link>
    );
  }

  if (session?.authMode === 'local') {
    return (
      <Link to="/profile" className={`${styles.connectBtn} ${styles.connected} ${styles.localConnected}`}>
        <PersonIcon />
        <span>{session.username}</span>
      </Link>
    );
  }

  return (
    <>
      <button className={styles.connectBtn} onClick={() => setIsModalOpen(true)}>
        <PersonIcon />
        <span>Log In</span>
      </button>

      {/* The modal is rendered at the root level here, waiting to pop up */}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
