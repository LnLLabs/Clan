import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgRoot = path.resolve(__dirname, '..');
const srcThemesDir = path.join(pkgRoot, 'src', 'themes');
const distThemesDir = path.join(pkgRoot, 'dist', 'themes');

await mkdir(distThemesDir, { recursive: true });

await Promise.all([
  copyFile(path.join(srcThemesDir, 'dark.css'), path.join(distThemesDir, 'dark.css')),
  copyFile(path.join(srcThemesDir, 'light.css'), path.join(distThemesDir, 'light.css')),
]);


