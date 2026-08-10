import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

const CLASSIC_TOKEN_URL =
  'https://github.com/settings/tokens/new?scopes=gist&description=The%20Python%20Ledger%20Sync';

/**
 * Renders the "paste a GitHub PAT" flow: instructions, a token input,
 * and a status area. Doesn't know or care whether it's logging in fresh
 * or upgrading an existing local account — the caller supplies
 * `onSubmit(pat)`, which should verify the token and return the GitHub
 * user object (or throw).
 */
export default function GitHubPatForm({ onSubmit, onSuccess, submitLabel = 'Validate and Connect' }) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const handleSubmit = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setStatus({ state: 'error', message: 'Paste a token first.' });
      return;
    }
    setStatus({ state: 'validating', message: 'Validating token with GitHub...' });
    try {
      const user = await onSubmit(trimmed);
      // The caller (e.g. the profile page's upgrade section) may stop
      // rendering this form the instant the session flips to
      // 'github' — in that case there's nothing left to update.
      if (!isMountedRef.current) return;
      setStatus({ state: 'success', message: `Token verified. Connected as ${user.login}!` });
      onSuccess?.(user);
    } catch (error) {
      if (!isMountedRef.current) return;
      setStatus({ state: 'error', message: error.message || 'Invalid token. Please check and try again.' });
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.securityNotice}>
        <h3>🔐 Security & Privacy Notice</h3>
        <p>
          This site uses <strong>client-side tracking</strong>. Your Personal Access Token (PAT) is stored{' '}
          <em>only</em> in your browser's local storage and is sent directly to the GitHub API. It is{' '}
          <strong>never</strong> transmitted to our servers.
        </p>
      </section>

      <section className={styles.instructions}>
        <h3>How to Generate Your Token</h3>
        <ol>
          <li>
            Go to{' '}
            <a href={CLASSIC_TOKEN_URL} target="_blank" rel="noopener noreferrer">
              GitHub's classic token page
            </a>{' '}
            (pre-filled with the <code>gist</code> scope).
          </li>
          <li>
            Click <strong>&quot;Generate token&quot;</strong>.
          </li>
          <li>Copy the generated token and paste it below.</li>
        </ol>
        <p className={styles.scopeNote}>
          Cloud sync backs your progress up to a private Gist, which needs a <strong>classic</strong> token
          with the <code>gist</code> scope — fine-grained tokens don't support Gists yet. Any token works
          for just verifying your identity, but only a classic <code>gist</code>-scoped token can back up
          your progress.
        </p>
      </section>

      <section className={styles.tokenInputArea}>
        <label htmlFor="patInput">Paste your PAT (ghp_... or github_pat_...) here:</label>
        <input
          type="password"
          id="patInput"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_aBC123..."
        />
      </section>

      {status.message && (
        <div className={`${styles.statusMessage} ${styles[status.state]}`}>{status.message}</div>
      )}

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handleSubmit}
        disabled={status.state === 'validating'}
      >
        {status.state === 'validating' ? 'Verifying...' : submitLabel}
      </button>
    </div>
  );
}
