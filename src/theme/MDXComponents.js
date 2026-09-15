import MDXComponents from '@theme-original/MDXComponents';
import InteractivePython from '@site/src/components/InteractivePython';
import MemoryGraphBlock from '@site/src/components/MemoryGraphBlock';

export default {
  ...MDXComponents,
  // We wrap the standard 'pre' tag (which wraps code blocks)
  pre: (props) => {
    const metastring = props.children?.props?.metastring || '';

    if (metastring.includes('interactive')) {
      return <InteractivePython {...props} />;
    }
    if (metastring.includes('debug')) {
      return <MemoryGraphBlock {...props} />;
    }
    return <MDXComponents.pre {...props} />;
  },
};