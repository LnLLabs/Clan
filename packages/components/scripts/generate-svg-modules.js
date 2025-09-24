const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../src/assets');
const distAssetsDir = path.join(__dirname, '../dist/assets');

// Ensure dist/assets directory exists
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

// Read all SVG files
const svgFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.svg'));

// Generate a module for each SVG file
svgFiles.forEach(svgFile => {
  const svgPath = path.join(assetsDir, svgFile);
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Create a simple React component module
  const moduleContent = `const React = require('react');

const SvgComponent = (props) => {
  return React.createElement('svg', {
    ...props,
    dangerouslySetInnerHTML: {
      __html: \`${svgContent.replace(/`/g, '\\`')}\`
    }
  });
};

module.exports = {
  ReactComponent: SvgComponent,
  default: '${svgFile}'
};`;

  // Write the module file
  const moduleFile = path.join(distAssetsDir, svgFile + '.js');
  fs.writeFileSync(moduleFile, moduleContent);
  
  // Create TypeScript declaration file
  const declarationContent = `import React from 'react';

export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
export default string;`;

  const declarationFile = path.join(distAssetsDir, svgFile + '.d.ts');
  fs.writeFileSync(declarationFile, declarationContent);
});

console.log(`Generated ${svgFiles.length} SVG modules`);
