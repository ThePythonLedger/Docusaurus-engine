import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useTracker } from '../../context/TrackerContext';
import styles from './styles.module.css';

/**
 * Drop `<MarkLessonComplete />` anywhere inside a lesson's .mdx file
 * (registered globally in MDXComponents.js, so no import needed there).
 *
 * It reads the current doc's id/title straight from Docusaurus via
 * useDoc() — nothing to configure per-lesson, and it works the same
 * whether the doc came from the `/lessons` or `/introduction` plugin
 * instance. `metadata.permalink` is used as the tracked id instead of
 * `metadata.id` because permalinks are unique across the whole site,
 * while doc ids are only guaranteed unique within a single plugin
 * instance — two different docs plugins could otherwise both have a
 * doc called "intro".
 */
export default function MarkLessonComplete() {
  const { progress, toggleLesson } = useTracker();
  const { metadata } = useDoc();

  const isDone = progress.completed.some((entry) =>
    typeof entry === 'string' ? entry === metadata.permalink : entry.id === metadata.permalink
  );

  return (
    <button
      type="button"
      className={`${styles.toggle} ${isDone ? styles.done : ''}`}
      onClick={() => toggleLesson(metadata.permalink, metadata.title)}
    >
      {isDone ? '✅ Lesson complete' : '☐ Mark this lesson complete'}
    </button>
  );
}
