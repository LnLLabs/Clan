// Simple test to verify the build is working
const fs = require('fs');
const path = require('path');

console.log('Testing BroClan Framework Build...');

// Check if dist directories exist
const packages = ['core', 'components', 'providers', 'helpers'];

packages.forEach(pkg => {
  const distPath = path.join(__dirname, 'packages', pkg, 'dist');
  const indexPath = path.join(distPath, 'index.js');

  if (fs.existsSync(indexPath)) {
    console.log(`✅ ${pkg} package built successfully`);
  } else {
    console.log(`❌ ${pkg} package build failed - missing index.js`);
  }
});

console.log('\nBuild test complete!');
