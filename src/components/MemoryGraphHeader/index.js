import React, { useMemo } from 'react';
import styles from './styles.module.css';

const MEMORY_GRAPH_BASE_URL = 'https://memory-graph.com/';

/**
 * Purple header bar linking a code snippet out to Bas Terwijn's Memory
 * Graph web debugger (memory-graph.com). This is just the bar + link —
 * it doesn't render the code itself, so it can sit above either a plain
 * <pre> (```lang debug, via MemoryGraphBlock) or InteractivePython's
 * editable sandbox (```lang interactive debug, via MDXComponents).
 *
 * `code` is the raw (untrimmed is fine) source string; `flush` squares
 * off the bottom edge and drops the outer margin so it butts directly
 * against whatever renders right beneath it, instead of floating as its
 * own rounded pill.
 */
export default function MemoryGraphHeader({ code, flush = false }) {
  const memoryGraphUrl = useMemo(
    () => `${MEMORY_GRAPH_BASE_URL}#code=${encodeURIComponent((code || '').trim())}`,
    [code]
  );

  return (
    <div className={`${styles.header} ${flush ? styles.flush : ''}`}>
      <span className={styles.headerText}>Debug Mode</span>
      <a
        href={memoryGraphUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.openButton}
      >
        View on Memory Graph ↗
      </a>
    </div>
  );
}
