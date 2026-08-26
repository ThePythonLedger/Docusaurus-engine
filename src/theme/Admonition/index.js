import React from 'react';
import Admonition from '@theme-original/Admonition';

export default function AdmonitionWrapper(props) {
  if (props.type === 'explore') {
    return (
      <Admonition
        {...props}
        type="info"
        className={`alert--explore ${props.className || ''}`}
        icon="📚"
        title={props.title ?? 'Learn more'}
      />
    );
  }
  return <Admonition {...props} />;
}