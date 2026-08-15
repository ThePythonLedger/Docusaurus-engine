import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

export default function LayoutWrapper(props) {
  const { frontMatter } = useDoc();

  return (
    <>
      {frontMatter?.isDraft && (
        <div className="margin-bottom--md">
          <span 
            className="badge badge--warning" 
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
          >
            🚧 Work in Progress / Draft
          </span>
        </div>
      )}
      <Layout {...props} />
    </>
  );
}