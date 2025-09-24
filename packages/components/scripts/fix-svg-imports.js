const fs = require('fs');
const path = require('path');

const assetsIndexJsPath = path.join(__dirname, '../dist/assets/index.js');
const assetsIndexDtsPath = path.join(__dirname, '../dist/assets/index.d.ts');

// Fix JavaScript file
if (fs.existsSync(assetsIndexJsPath)) {
  let content = fs.readFileSync(assetsIndexJsPath, 'utf8');
  
  // Replace .svg imports with .svg.js imports
  content = content.replace(/require\("\.\/([^"]+)\.svg"\)/g, 'require("./$1.svg.js")');
  
  fs.writeFileSync(assetsIndexJsPath, content);
  console.log('Fixed SVG imports in assets/index.js');
} else {
  console.log('Assets index.js file not found');
}

// Fix TypeScript declaration file
if (fs.existsSync(assetsIndexDtsPath)) {
  let content = fs.readFileSync(assetsIndexDtsPath, 'utf8');
  
  // Replace .svg imports with .svg.js imports
  content = content.replace(/from '\.\/([^']+)\.svg'/g, "from './$1.svg.js'");
  
  fs.writeFileSync(assetsIndexDtsPath, content);
  console.log('Fixed SVG imports in assets/index.d.ts');
} else {
  console.log('Assets index.d.ts file not found');
}
