import React, { useMemo } from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import styles from './styles.module.css';

const MEMORY_GRAPH_BASE_URL = 'https://memory-graph.com/';

/**
 * Wraps a ```lang debug code block with a header bar linking out to
 * Bas Terwijn's Memory Graph web debugger (memory-graph.com), so students
 * can step through the exact snippet from the lesson and watch variables/
 * references change line by line.
 *
 * Unlike InteractivePython, this doesn't replace the block with an editor —
 * the theme's normal <pre> still renders (syntax highlighting, copy button,
 * line numbers all keep working). We just read the raw code to build a
 * deep link and drop a button above it.
 *
 * Memory Graph reads code from a URL *fragment* (`#code=...`), not a query
 * string — that's deliberate on their end, it means the code never gets
 * sent to their server, it's only ever interpreted client-side once the
 * page loads. Don't "fix" this to `?code=`.
 */
export default function MemoryGraphBlock(props) {
  const { children } = props;
  const rawCode = children?.props?.children?.trim() || '';

  const memoryGraphUrl = useMemo(
    () => `${MEMORY_GRAPH_BASE_URL}#code=${encodeURIComponent(rawCode)}`,
    [rawCode]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerText}>Debug Mode</span>
        <a
          href={memoryGraphUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openButton}
        >
          Open in Memory Graph ↗
        </a>
      </div>
      <MDXComponents.pre {...props} />
    </div>
  );
}