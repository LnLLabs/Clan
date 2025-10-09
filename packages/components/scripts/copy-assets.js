const fs = require('fs');
const path = require('path');

// Copy SVG assets
const srcAssetsDir = path.join(__dirname, '../src/assets');
const distAssetsDir = path.join(__dirname, '../dist/assets');

// Ensure dist/assets directory exists
if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

// Copy all SVG files
const svgFiles = fs.readdirSync(srcAssetsDir).filter(file => file.endsWith('.svg'));

svgFiles.forEach(svgFile => {
  const srcFile = path.join(srcAssetsDir, svgFile);
  const distFile = path.join(distAssetsDir, svgFile);
  
  fs.copyFileSync(srcFile, distFile);
  console.log(`Copied ${svgFile} to dist/assets/`);
});

// Copy CSS files
const srcStylesDir = path.join(__dirname, '../src/styles');
const distStylesDir = path.join(__dirname, '../dist/styles');

// Ensure dist/styles directory exists
if (!fs.existsSync(distStylesDir)) {
  fs.mkdirSync(distStylesDir, { recursive: true });
}

// Copy CSS files directly to dist/styles
const cssFiles = ['index.css', 'components.css'];

cssFiles.forEach(cssFile => {
  const srcFile = path.join(srcStylesDir, cssFile);
  const distFile = path.join(distStylesDir, cssFile);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, distFile);
    console.log(`Copied ${cssFile} to dist/styles/`);
  } else {
    console.log(`Warning: ${cssFile} not found in src/styles/`);
  }
});

console.log('Asset copying completed successfully!');

