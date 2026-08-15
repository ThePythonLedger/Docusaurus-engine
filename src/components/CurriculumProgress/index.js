import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

// The docs plugin's global data is a flat list of every doc in that
// plugin instance: [{ id, path, sidebar }]. `id` is the same
// "category-slug/lesson-slug" shape the curriculum-manifest plugin
// builds its `docId`s in (both ultimately derive from the same
// folder/file names), so this just maps docId -> real permalink.
// Generated category-index pages show up in this list too, with an
// `id` that starts with "/" instead of a plain slug — those aren't
// lessons, so they're filtered out.
function usePermalinkMap(pluginId) {
  const docsData = useDocsData(pluginId);
  return useMemo(() => {
    const docs = docsData?.versions?.[0]?.docs ?? [];
    const map = {};
    docs.forEach((doc) => {
      if (!doc.id.startsWith('/')) map[doc.id] = doc.path;
    });
    return map;
  }, [docsData]);
}

function CategoryGroup({ category, isExpanded, onToggle }) {
  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.groupHeaderLeft}>
          <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`} aria-hidden="true">
            ▸
          </span>
          <span className={styles.groupLabel}>
            {category.isComplete && (
              <span className={styles.groupCheck} aria-hidden="true">
                ✅{' '}
              </span>
            )}
            {category.label}
          </span>
        </span>
        <span className={styles.groupCount}>
          {category.completedCount}/{category.total}
        </span>
      </button>
      {isExpanded && (
        <ul className={styles.lessonList}>
          {category.lessons.map((lesson) => (
            <li key={lesson.docId} className={styles.lessonItem}>
              {lesson.permalink ? (
                <Link to={lesson.permalink} className={styles.lessonLink}>
                  <span aria-hidden="true">{lesson.done ? '✅' : '☐'}</span> {lesson.title}
                </Link>
              ) : (
                <span className={styles.lessonLink}>
                  <span aria-hidden="true">{lesson.done ? '✅' : '☐'}</span> {lesson.title}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Renders one curriculum "section" (the main course, or the Advanced
 * track) as a list of collapsible per-directory groups, each showing
 * its lessons with a done/not-done marker.
 *
 * Expand state: closed by default, except the first not-yet-completed
 * category (the one the student is currently working through) — that
 * one starts open. Finishing a category's last lesson flips it to a
 * green check and, since it's no longer "the current one," the next
 * incomplete category becomes the one that's open by default.
 * Clicking a header always toggles that category manually and that
 * choice sticks, on top of the default.
 */
export default function CurriculumProgress({ section, pluginId, completedIds }) {
  const permalinkMap = usePermalinkMap(pluginId);
  const [overrides, setOverrides] = useState({});

  const categories = useMemo(() => {
    return section.categories.map((category) => {
      const lessons = category.lessons.map((lesson) => {
        const permalink = permalinkMap[lesson.docId];
        const done = Boolean(permalink && completedIds.has(permalink));
        return { ...lesson, permalink, done };
      });
      const total = lessons.length;
      const completedCount = lessons.filter((l) => l.done).length;
      return {
        slug: category.slug,
        label: category.label,
        lessons,
        total,
        completedCount,
        isComplete: total > 0 && completedCount === total,
      };
    });
  }, [section, permalinkMap, completedIds]);

  const currentSlug = useMemo(() => {
    const current = categories.find((c) => !c.isComplete);
    return current ? current.slug : null;
  }, [categories]);

  if (categories.length === 0) {
    return <p className={styles.emptyState}>No lessons here yet — check back soon.</p>;
  }

  const totalLessons = categories.reduce((sum, c) => sum + c.total, 0);
  const totalCompleted = categories.reduce((sum, c) => sum + c.completedCount, 0);

  return (
    <div>
      <p className={styles.sectionSummary}>
        {totalCompleted}/{totalLessons} lessons completed
        {totalLessons > 0 && totalCompleted === totalLessons && ' 🎉'}
      </p>
      <div className={styles.groups}>
        {categories.map((category) => {
          const expanded = overrides[category.slug] ?? category.slug === currentSlug;
          return (
            <CategoryGroup
              key={category.slug}
              category={category}
              isExpanded={expanded}
              onToggle={() => setOverrides((prev) => ({ ...prev, [category.slug]: !expanded }))}
            />
          );
        })}
      </div>
    </div>
  );
}
