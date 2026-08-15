import { useMemo } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import GitHubConnectButton from '@site/src/components/GitHubConnectButton';
import { useTracker } from '@site/src/context/TrackerContext';
import { useResolvedCategories, findNextLesson } from '@site/src/utils/curriculumProgress';

import Heading from '@theme/Heading';
import styles from './index.module.css';

// A signed-in student with progress already made picks up where they
// left off instead of seeing the generic pitch again. `isLoaded` guards
// against briefly flashing the wrong copy before localStorage is read
// (the server-rendered version always has no session, so defaulting to
// the logged-out copy pre-hydration matches what most visitors see).
function useHeroCta() {
  const { progress, isLoaded } = useTracker();
  const manifest = usePluginData('curriculum-manifest-plugin');
  const courseSection = manifest.sections.find((s) => s.key === 'default');
  const completedIds = useMemo(() => {
    const entries = Array.isArray(progress?.completed) ? progress.completed : [];
    return new Set(entries.map((entry) => (typeof entry === 'string' ? entry : entry.id)));
  }, [progress?.completed]);
  const categories = useResolvedCategories(courseSection, 'default', completedIds);

  if (!isLoaded || !progress?.session) {
    return { label: 'Start Learning Python ➡️', to: '/lessons/introduction/how-course-works' };
  }

  const nextLesson = findNextLesson(categories);
  if (!nextLesson) {
    return { label: "You've Completed the Course 🎉", to: '/profile' };
  }
  return { label: `Continue: ${nextLesson.title}`, to: nextLesson.permalink };
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const cta = useHeroCta();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">The open-source, community-driven roadmap to Python mastery.</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to={cta.to}>
            {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Free, comprehensive curriculum designed to take students from their first 'Hello World' to building professional-grade applications in Python. ">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
