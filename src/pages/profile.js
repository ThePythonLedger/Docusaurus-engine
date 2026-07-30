import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { useTracker } from '../context/TrackerContext';
import { verifyGitHubToken } from '../utils/github';
import DataTransfer from '../components/DataTransfer';
import styles from './profile.module.css';

// Older completed-lesson entries may only be a raw doc id
// (e.g. "foundations/variables") with no stored title — turn
// that into something readable instead of showing the raw slug.
function formatLessonLabel(entry) {
  if (entry.title) return entry.title;
  const slug = entry.id.split('/').pop() ?? entry.id;
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const { progress, isLoaded, logout } = useTracker();
  const [liveUser, setLiveUser] = useState(null);
  const [userError, setUserError] = useState(null);

  // Re-verify against the GitHub API on load so the avatar/username
  // stay current even if they've changed since the token was saved.
  useEffect(() => {
    if (!progress?.token) return;
    let cancelled = false;
    verifyGitHubToken(progress.token)
      .then((user) => {
        if (!cancelled) setLiveUser(user);
      })
      .catch(() => {
        if (!cancelled) {
          setUserError("Couldn't refresh your GitHub info — showing your last saved details.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [progress?.token]);

  if (!isLoaded) {
    // Avoid flashing the "not connected" state while localStorage loads.
    return (
      <Layout title="Profile">
        <div className="container margin-vert--lg" />
      </Layout>
    );
  }

  if (!progress?.token) {
    return (
      <Layout title="Profile">
        <main className="container margin-vert--lg">
          <div className={styles.loggedOut}>
            <h1>You're not connected yet</h1>
            <p>Connect your GitHub account from the homepage to see your profile and track your progress.</p>
            <Link className="button button--primary" to="/">
              Go to homepage
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const user = liveUser ?? progress.user;
  const completedEntries = (Array.isArray(progress.completed) ? progress.completed : [])
    .map((entry) => (typeof entry === 'string' ? { id: entry, title: null, completedAt: null } : entry))
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return (
    <Layout title="Profile" description="Your Python Ledger profile and progress">
      <main className="container margin-vert--lg">
        <div className={styles.header}>
          {user?.avatar_url && (
            <img src={user.avatar_url} alt={`${user.login}'s GitHub avatar`} className={styles.avatar} />
          )}
          <div>
            <h1 className={styles.username}>{user?.name || user?.login}</h1>
            {user?.name && <p className={styles.handle}>@{user.login}</p>}
            {user?.html_url && (
              <a href={user.html_url} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
                View on GitHub ↗
              </a>
            )}
          </div>
          <button className={styles.logoutButton} onClick={logout}>
            Log out
          </button>
        </div>

        {userError && <p className={styles.warning}>{userError}</p>}

        <section className={styles.section}>
          <h2>Progress</h2>
          <p className={styles.progressSummary}>
            {completedEntries.length === 0
              ? "You haven't completed any lessons yet."
              : `${completedEntries.length} lesson${completedEntries.length === 1 ? '' : 's'} completed`}
          </p>
          {completedEntries.length > 0 && (
            <ul className={styles.lessonList}>
              {completedEntries.map((entry) => (
                <li key={entry.id} className={styles.lessonItem}>
                  <span>✅ {formatLessonLabel(entry)}</span>
                  {entry.completedAt && (
                    <span className={styles.lessonDate}>
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <h2>Your data</h2>
          <DataTransfer />
        </section>
      </main>
    </Layout>
  );
}
