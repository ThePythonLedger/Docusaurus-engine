import MDXComponents from '@theme-original/MDXComponents';
import InteractivePython from '@site/src/components/InteractivePython';
import MemoryGraphBlock from '@site/src/components/MemoryGraphBlock';
import MemoryGraphHeader from '@site/src/components/MemoryGraphHeader';

export default {
  ...MDXComponents,
  // We wrap the standard 'pre' tag (which wraps code blocks)
  pre: (props) => {
    const metastring = props.children?.props?.metastring || '';
    const isInteractive = metastring.includes('interactive');
    const isDebug = metastring.includes('debug');

    if (isInteractive && isDebug) {
      const rawCode = props.children?.props?.children || '';
      return (
        <>
          <MemoryGraphHeader code={rawCode} />
          <InteractivePython {...props} />
        </>
      );
    }
    if (isInteractive) {
      return <InteractivePython {...props} />;
    }
    if (isDebug) {
      return <MemoryGraphBlock {...props} />;
    }
    return <MDXComponents.pre {...props} />;
  },
};