declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
  export { ReactComponent };
}

declare module '*.css' {
  const content: string;
  export default content;
}