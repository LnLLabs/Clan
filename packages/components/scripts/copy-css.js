const fs = require('fs');
const path = require('path');

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
