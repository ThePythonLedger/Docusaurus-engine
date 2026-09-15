import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import MemoryGraphHeader from '@site/src/components/MemoryGraphHeader';
import styles from './styles.module.css';

/**
 * Wraps a ```lang debug (debug-only) code block: a flush MemoryGraphHeader
 * sitting directly on top of the theme's normal <pre>, so syntax
 * highlighting and the built-in copy button keep working.
 *
 * For ```lang interactive debug (both keywords), MDXComponents renders
 * MemoryGraphHeader directly above InteractivePython instead, skipping
 * this component entirely — see src/theme/MDXComponents.js.
 */
export default function MemoryGraphBlock(props) {
  const rawCode = props.children?.props?.children || '';

  return (
    <div className={styles.wrapper}>
      <MemoryGraphHeader code={rawCode} flush />
      <MDXComponents.pre {...props} />
    </div>
  );
}
