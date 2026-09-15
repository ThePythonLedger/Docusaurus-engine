import React, { useMemo } from 'react';
import styles from './styles.module.css';

const MEMORY_GRAPH_BASE_URL = 'https://memory-graph.com/';

/**
 * Just the "View on Memory Graph" link — no header bar, no label text.
 * Rendered directly inside InteractivePython's own header row when a
 * block is both `interactive` and `debug` (right-aligned next to
 * "Python Sandbox"), and reused by MemoryGraphHeader — which adds the
 * "Debug Mode" label + purple bar — for the debug-only case.
 */
export default function MemoryGraphButton({ code, className = '' }) {
  const memoryGraphUrl = useMemo(
    () => `${MEMORY_GRAPH_BASE_URL}#code=${encodeURIComponent((code || '').trim())}`,
    [code]
  );

  return (
    <a
      href={memoryGraphUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.openButton} ${className}`}
    >
      View on Memory Graph ↗
    </a>
  );
}
