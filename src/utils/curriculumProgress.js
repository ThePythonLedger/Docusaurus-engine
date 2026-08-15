import { useMemo } from 'react';
import { useDocsData } from '@docusaurus/plugin-content-docs/client';

// The docs plugin's global data is a flat list of every doc in that
// plugin instance: [{ id, path, sidebar }]. `id` is the same
// "category-slug/lesson-slug" shape the curriculum-manifest plugin
// builds its `docId`s in (both ultimately derive from the same
// folder/file names), so this just maps docId -> real permalink.
// Generated category-index pages show up in this list too, with an
// `id` that starts with "/" instead of a plain slug — those aren't
// lessons, so they're filtered out.
export function usePermalinkMap(pluginId) {
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

// Resolves a curriculum-manifest section (categories + lessons) into
// the same shape, but with each lesson's real permalink and
// completion status attached, plus per-category totals. Category and
// lesson order is preserved from the manifest (already sorted by
// `_category_.json`/`sidebar_position`).
export function useResolvedCategories(section, pluginId, completedIds) {
  const permalinkMap = usePermalinkMap(pluginId);
  return useMemo(() => {
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
}

// First not-yet-completed lesson across the resolved categories, in
// curriculum order — i.e. "what should this student do next". Returns
// null once everything is done (or if there's nothing trackable yet).
export function findNextLesson(resolvedCategories) {
  for (const category of resolvedCategories) {
    const lesson = category.lessons.find((l) => !l.done && l.permalink);
    if (lesson) return lesson;
  }
  return null;
}
