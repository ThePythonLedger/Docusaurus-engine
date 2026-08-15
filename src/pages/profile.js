import React, { useEffect, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useTracker } from '../context/TrackerContext';
import { verifyGitHubToken } from '../utils/github';
import DataTransfer from '../components/DataTransfer';
import GitHubPatForm from '../components/GitHubPatForm';
import CurriculumProgress from '../components/CurriculumProgress';
import styles from './profile.module.css';

function SyncStatusBadge({ syncStatus, syncError, lastSyncedAt, retrySync }) {
  if (syncStatus === 'syncing') {
    return <p className={styles.syncStatus}>⏳ Backing up your progress to GitHub…</p>;
  }
  if (syncStatus === 'error') {
    return (
      <p className={`${styles.syncStatus} ${styles.syncError}`}>
        ⚠️ {syncError ?? 'GitHub backup failed.'}{' '}
        <button type="button" className={styles.retryLink} onClick={retrySync}>
          Retry
        </button>
      </p>
    );
  }
  if (syncStatus === 'synced' && lastSyncedAt) {
    return (
      <p className={styles.syncStatus}>
        ☁️ Backed up to GitHub · {new Date(lastSyncedAt).toLocaleString()}
      </p>
    );
  }
  return <p className={styles.syncStatus}>Your progress backs up to GitHub automatically as you go.</p>;
}

// Shown to local-mode users so they can opt in to GitHub cloud sync
// without losing anything they've already done locally.
function GitHubUpgradeSection() {
  const { upgradeToGithub } = useTracker();
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className={styles.upgradeBanner}>
        <div>
          <strong>Your progress lives only in this browser.</strong>
          <p>Connect GitHub to back it up and keep it safe if you switch devices.</p>
        </div>
        <button type="button" className={styles.upgradeButton} onClick={() => setExpanded(true)}>
          Connect GitHub to Enable Cloud Sync
        </button>
      </div>
    );
  }

  return (
    <div className={styles.upgradeExpanded}>
      <GitHubPatForm onSubmit={upgradeToGithub} submitLabel="Connect & Upload Progress" />
      <button type="button" className={styles.cancelLink} onClick={() => setExpanded(false)}>
        Cancel
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { progress, isLoaded, logout, syncStatus, syncError, lastSyncedAt, retrySync } = useTracker();
  const session = progress?.session;
  const [liveUser, setLiveUser] = useState(null);
  const [userError, setUserError] = useState(null);
  const manifest = usePluginData('curriculum-manifest-plugin');
  const completedIds = useMemo(() => {
    const entries = Array.isArray(progress?.completed) ? progress.completed : [];
    return new Set(entries.map((entry) => (typeof entry === 'string' ? entry : entry.id)));
  }, [progress?.completed]);

  // Re-verify against the GitHub API on load so the avatar/username
  // stay current even if they've changed since the token was saved.
  useEffect(() => {
    if (session?.authMode !== 'github' || !session.pat) {
      setLiveUser(null);
      return;
    }
    let cancelled = false;
    verifyGitHubToken(session.pat)
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
  }, [session?.authMode, session?.pat]);

  if (!isLoaded) {
    // Avoid flashing the "not connected" state while localStorage loads.
    return (
      <Layout title="Profile">
        <div className="container margin-vert--lg" />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Profile">
        <main className="container margin-vert--lg">
          <div className={styles.loggedOut}>
            <h1>You're not logged in yet</h1>
            <p>Log in from the homepage — pick a username to start instantly, or connect GitHub for cloud sync.</p>
            <Link className="button button--primary" to="/">
              Go to homepage
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const githubUser = session.authMode === 'github' ? liveUser ?? session.githubProfile : null;

  return (
    <Layout title="Profile" description="Your Python Ledger profile and progress">
      <main className="container margin-vert--lg">
        <div className={styles.header}>
          {githubUser?.avatar_url && (
            <img src={githubUser.avatar_url} alt={`${githubUser.login}'s GitHub avatar`} className={styles.avatar} />
          )}
          <div>
            <h1 className={styles.username}>
              {session.authMode === 'github' ? githubUser?.name || githubUser?.login : session.username}
            </h1>
            {session.authMode === 'github' ? (
              <>
                {githubUser?.name && <p className={styles.handle}>@{githubUser.login}</p>}
                {githubUser?.html_url && (
                  <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
                    View on GitHub ↗
                  </a>
                )}
              </>
            ) : (
              <p className={styles.handle}>Local account · progress saved in this browser</p>
            )}
          </div>
          <button className={styles.logoutButton} onClick={() => logout()}>
            Log out
          </button>
        </div>

        {userError && <p className={styles.warning}>{userError}</p>}

        {session.authMode === 'github' && (
          <SyncStatusBadge
            syncStatus={syncStatus}
            syncError={syncError}
            lastSyncedAt={lastSyncedAt}
            retrySync={retrySync}
          />
        )}

        {session.authMode === 'local' && (
          <section className={styles.section}>
            <GitHubUpgradeSection />
          </section>
        )}

        <section className={styles.section}>
          <h2>Progress</h2>
          {manifest.sections.map((section) => (
            <div key={section.key} className={styles.progressSection}>
              <h3>{section.label}</h3>
              <CurriculumProgress section={section} pluginId={section.key} completedIds={completedIds} />
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>Your data</h2>
          <DataTransfer />
        </section>
      </main>
    </Layout>
  );
}
