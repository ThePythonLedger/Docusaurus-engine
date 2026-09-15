import React from 'react';
import MemoryGraphButton from '@site/src/components/MemoryGraphButton';
import styles from './styles.module.css';

/**
 * Purple header bar used for debug-only blocks (```lang debug): a
 * "Debug Mode" label plus the Memory Graph button, sitting flush above
 * the theme's plain <pre> via MemoryGraphBlock. When a block is also
 * `interactive`, this isn't used at all — the button renders inline in
 * InteractivePython's own header instead (see MDXComponents.js).
 */
export default function MemoryGraphHeader({ code, flush = false }) {
  return (
    <div className={`${styles.header} ${flush ? styles.flush : ''}`}>
      <span className={styles.headerText}>Debug Mode</span>
      <MemoryGraphButton code={code} />
    </div>
  );
}
