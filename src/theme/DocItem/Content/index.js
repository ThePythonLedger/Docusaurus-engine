import React from 'react';
import ContentOriginal from '@theme-original/DocItem/Content';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import MarkLessonComplete from '@site/src/components/MarkLessonComplete';

/**
 * A "wrap" swizzle of the default theme's DocItem/Content — renders the
 * original content unchanged, then appends the mark-complete toggle for
 * any doc whose front matter opts in with `lesson: true`:
 *
 *   ---
 *   title: Variables
 *   lesson: true
 *   ---
 *
 * This runs for every doc across both docs plugin instances (/lessons
 * and /introduction), so introduction/meta pages simply stay untouched
 * as long as their front matter doesn't set the flag.
 */
export default function ContentWrapper(props) {
  const { frontMatter } = useDoc();
  return (
    <>
      <ContentOriginal {...props} />
      {Boolean(frontMatter.lesson) && <MarkLessonComplete />}
    </>
  );
}
