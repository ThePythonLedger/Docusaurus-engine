import React, { useRef, useState } from 'react';
import styles from './styles.module.css';
import { useTracker } from '../../context/TrackerContext';
import {
  buildExportPayload,
  downloadJSON,
  parseImportFile,
  mergeCompleted,
  normalizeCompleted,
} from '../../utils/dataTransfer';

export default function DataTransfer() {
  const { progress, importCompleted } = useTracker();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const handleDownload = () => {
    const payload = buildExportPayload(progress);
    const filename = `python-ledger-progress-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(filename, payload);
    setStatus({ type: 'success', message: 'Your progress file has been downloaded.' });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    try {
      const parsed = await parseImportFile(file);
      const beforeIds = new Set(normalizeCompleted(progress.completed).map((e) => e.id));
      const merged = mergeCompleted(progress.completed, parsed.completedLessons);
      const added = merged.filter((e) => !beforeIds.has(e.id)).length;

      importCompleted(merged);
      setStatus({
        type: 'success',
        message:
          added > 0
            ? `Imported ${added} new completed lesson${added === 1 ? '' : 's'}.`
            : 'File imported — no new lessons to add.',
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonsRow}>
        <button className={styles.actionButton} onClick={handleDownload}>
          <span aria-hidden="true">⬇</span> Download my data
        </button>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <span aria-hidden="true">⬆</span> Upload my data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
      </div>

      {status && (
        <p className={`${styles.statusMessage} ${styles[status.type]}`}>{status.message}</p>
      )}

      <p className={styles.hint}>
        Your progress is only stored in this browser. Download it before switching
        devices, then upload the file here on the new one to bring your completed
        lessons with you. The file never includes your GitHub token.
      </p>
    </div>
  );
}
