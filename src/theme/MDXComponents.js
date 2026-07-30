import MDXComponents from '@theme-original/MDXComponents';
import InteractivePython from '@site/src/components/InteractivePython';

export default {
  ...MDXComponents,
  // We wrap the standard 'pre' tag (which wraps code blocks)
  pre: (props) => {
    const isInteractive = props.children?.props?.metastring?.includes('interactive');
    
    if (isInteractive) {
      return <InteractivePython {...props} />;
    }
    return <MDXComponents.pre {...props} />;
  },
};