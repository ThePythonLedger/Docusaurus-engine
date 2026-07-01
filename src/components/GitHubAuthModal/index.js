import React, { useState } from 'react';
import styles from './styles.module.css'; // Add corresponding CSS
import { useTracker } from '../../context/TrackerContext'; // Import your established context
import { verifyGitHubToken } from '../../utils/github'; // Utility to verify token with GitHub

export default function GitHubAuthModal({ isOpen, onClose }) {
  const { saveToken } = useTracker();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  if (!isOpen) return null;

  const handleValidation = async () => {
    setStatus({ state: 'validating', message: 'Validating token with GitHub...' });
    try {
      // 1. Check the token using our client utility
      const user = await verifyGitHubToken(token);
      
      // 2. If valid, save it to TrackerContext (and thus localStorage)
      saveToken(token);
      
      // 3. Clear state and notify user
      setStatus({ state: 'success', message: `Token verified. Connected as ${user.login}!` });
      setTimeout(onClose, 1500); // Close modal on success
    } catch (error) {
      setStatus({ state: 'error', message: 'Invalid Token. Please check and try again.' });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <header className={styles.modalHeader}>
          <img src="/img/github-mark.svg" alt="GitHub Logo" className={styles.githubLogo} />
          <h2>Connect GitHub for Project Tracking</h2>
        </header>

        <section className={styles.securityNotice}>
          <h3>🔐 Security & Privacy Notice</h3>
          <p>
            This site uses <strong>client-side tracking</strong>. Your Personal Access Token (PAT) 
            is stored <em>only</em> in your browser's local storage and is sent directly 
            to the GitHub API. It is <strong>never</strong> transmitted to our servers.
          </p>
        </section>

        <section className={styles.instructions}>
          <h3>How to Generate Your Token</h3>
          <ol>
            <li>Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer">GitHub Fine-Grained Tokens</a>.</li>
            <li>Click <strong>'Generate new token'</strong>.</li>
            <li>Set 'Repository access' to <strong>'Public Repositories (read-only)'</strong>.</li>
            <li>Copy the generated token and paste it below.</li>
          </ol>
        </section>

        <section className={styles.tokenInputArea}>
          <label htmlFor="patInput">Paste your PAT (github_pat_...) here:</label>
          <input 
            type="password" 
            id="patInput"
            value={token} 
            onChange={(e) => setToken(e.target.value)} 
            placeholder="github_pat_aBC123..."
          />
        </section>

        {status.message && (
          <div className={`${styles.statusMessage} ${styles[status.state]}`}>
            {status.message}
          </div>
        )}

        <footer className={styles.modalFooter}>
          <button className={styles.secondaryButton} onClick={onClose}>Cancel</button>
          <button 
            className={styles.primaryButton} 
            onClick={handleValidation}
            disabled={status.state === 'validating'}
          >
            {status.state === 'validating' ? 'Verifying...' : 'Validate and Connect'}
          </button>
        </footer>
      </div>
    </div>
  );
}