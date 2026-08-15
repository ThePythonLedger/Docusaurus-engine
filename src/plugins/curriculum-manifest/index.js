// Build-time-only plugin. It never touches the browser: at build/start
// time it walks the curriculum content directories, reads each
// `_category_.json` plus each lesson's front matter, and exposes the
// result as global data so any page (including /profile, which is not
// a doc route) can render "curriculum outline + progress" without
// re-deriving Docusaurus's own slug/id logic.
//
// Why not just read the sidebar that the docs plugin already builds?
// That richer, category-shaped sidebar tree only gets attached to doc
// *routes* (it's passed as route props, not global data) — a plain
// page component has no way to reach it. The docs plugin's *global*
// data is a flat, uncategorized list of {id, path}. So this plugin
// supplies the missing piece (category grouping, labels, ordering)
// and profile.js cross-references it against that flat list to get
// real permalinks. See MarkLessonComplete for the corresponding
// `lesson: true` front-matter flag that gates what counts as
// trackable here.

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Mirrors @docusaurus/plugin-content-docs's DefaultNumberPrefixParser
// (numberPrefix.ts) so folder/file names like "03-git-basics" or
// "01 - introduction" resolve to the same slug segment Docusaurus
// itself uses for the doc's id/permalink ("git-basics", "introduction").
const IGNORED_PREFIX_PATTERN = /^\d+[-_.]\d+/;
const NUMBER_PREFIX_PATTERN = /^(\d+)\s*[-_.]+\s*([^-_.\s].*)$/;

function stripNumberPrefix(name) {
  if (IGNORED_PREFIX_PATTERN.test(name)) return name;
  const match = NUMBER_PREFIX_PATTERN.exec(name);
  return match ? match[2] : name;
}

function titleCaseFromSlug(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function readCategoryMeta(dirPath, dirName) {
  const fallback = { label: titleCaseFromSlug(stripNumberPrefix(dirName)), position: null };
  const categoryFile = path.join(dirPath, '_category_.json');
  if (!fs.existsSync(categoryFile)) return fallback;
  try {
    const raw = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
    return {
      label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : fallback.label,
      position: typeof raw.position === 'number' ? raw.position : null,
    };
  } catch {
    // Malformed _category_.json shouldn't take the whole build down —
    // fall back to a name derived from the folder instead.
    return fallback;
  }
}

// Returns null for docs that don't opt in via `lesson: true` front
// matter — those can't be marked complete (see MarkLessonComplete),
// so there is nothing meaningful to track for them here.
function readLessonDoc(filePath, fileName) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  if (!data.lesson) return null;

  const baseName = fileName.replace(/\.mdx?$/, '');
  const docSlug = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : stripNumberPrefix(baseName);
  const title =
    (typeof data.title === 'string' && data.title.trim()) ||
    (typeof data.sidebar_label === 'string' && data.sidebar_label.trim()) ||
    titleCaseFromSlug(stripNumberPrefix(baseName));

  return {
    docSlug,
    title,
    position: typeof data.sidebar_position === 'number' ? data.sidebar_position : null,
  };
}

function sortByPositionThenIndex(items, getPosition) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const pa = getPosition(a.item) ?? Number.MAX_SAFE_INTEGER;
      const pb = getPosition(b.item) ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return a.index - b.index; // stable: preserve directory-listing order on ties
    })
    .map(({ item }) => item);
}

function scanSection(rootPath) {
  if (!fs.existsSync(rootPath)) return [];

  const entries = fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const categories = entries
    .map((entry) => {
      const dirPath = path.join(rootPath, entry.name);
      const meta = readCategoryMeta(dirPath, entry.name);
      const slug = stripNumberPrefix(entry.name);

      const lessonFiles = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((e) => e.isFile() && /\.mdx?$/.test(e.name))
        .sort((a, b) => a.name.localeCompare(b.name));

      const lessons = sortByPositionThenIndex(
        lessonFiles
          .map((f) => readLessonDoc(path.join(dirPath, f.name), f.name))
          .filter(Boolean)
          .map((lesson) => ({ ...lesson, docId: `${slug}/${lesson.docSlug}` })),
        (l) => l.position
      );

      return { slug, label: meta.label, position: meta.position, lessons };
    })
    // A category with nothing trackable yet (no `lesson: true` docs)
    // has nothing useful to show in a progress tracker — skip it.
    .filter((category) => category.lessons.length > 0);

  return sortByPositionThenIndex(categories, (c) => c.position);
}

module.exports = function curriculumManifestPlugin(context, options) {
  const { sections = [] } = options ?? {};
  return {
    name: 'curriculum-manifest-plugin',
    async loadContent() {
      return {
        sections: sections.map((section) => ({
          key: section.key,
          label: section.label,
          categories: scanSection(path.resolve(context.siteDir, section.path)),
        })),
      };
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};
