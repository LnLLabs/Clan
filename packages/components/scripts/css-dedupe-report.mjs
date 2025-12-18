import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

/**
 * Duplicate selector report for packages/components/src CSS files
 *
 * - At-rule aware: selector uniqueness is tracked per at-rule context
 *   (e.g. base vs @media ... are treated separately).
 * - Outputs JSON + a readable Markdown summary.
 */

const pkgRoot = path.resolve(process.cwd());
const srcRoot = path.join(pkgRoot, 'src');

async function listCssFiles(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listCssFiles(full)));
    else if (e.isFile() && e.name.endsWith('.css')) out.push(full);
  }
  return out;
}

function atRuleContext(node) {
  const parts = [];
  let cur = node.parent;
  while (cur) {
    if (cur.type === 'atrule') parts.push(`@${cur.name} ${cur.params}`.trim());
    cur = cur.parent;
  }
  // outermost first
  return parts.reverse().join(' | ') || 'base';
}

function normalizeSelector(sel) {
  return sel.replace(/\s+/g, ' ').trim();
}

function declMap(rule) {
  const map = {};
  rule.walkDecls((d) => {
    // last one wins within same rule block
    map[d.prop] = d.value;
  });
  return map;
}

function shallowEqual(a, b) {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  for (let i = 0; i < ak.length; i++) {
    if (ak[i] !== bk[i]) return false;
    if (a[ak[i]] !== b[bk[i]]) return false;
  }
  return true;
}

const cssFiles = await listCssFiles(srcRoot);

/** key: `${context}::${selector}` -> occurrences[] */
const index = new Map();

for (const file of cssFiles) {
  const css = await readFile(file, 'utf8');
  const root = postcss.parse(css, { from: file });
  root.walkRules((rule) => {
    // Ignore keyframe steps like "from"/"to"/"50%"
    if (rule.parent?.type === 'atrule' && rule.parent.name === 'keyframes') return;
    if (!rule.selector) return;

    const ctx = atRuleContext(rule);
    const selectors = rule.selectors?.length ? rule.selectors : [rule.selector];
    for (const s of selectors) {
      const selector = normalizeSelector(s);
      const key = `${ctx}::${selector}`;
      const occ = {
        file: path.relative(pkgRoot, file),
        line: rule.source?.start?.line ?? null,
        context: ctx,
        selector,
        decls: declMap(rule),
      };
      const arr = index.get(key) ?? [];
      arr.push(occ);
      index.set(key, arr);
    }
  });
}

const duplicates = [];
for (const [key, occs] of index.entries()) {
  if (occs.length < 2) continue;
  const same = occs.every((o) => shallowEqual(o.decls, occs[0].decls));
  duplicates.push({
    key,
    context: occs[0].context,
    selector: occs[0].selector,
    count: occs.length,
    identicalDecls: same,
    occurrences: occs,
  });
}

duplicates.sort((a, b) => {
  if (a.selector !== b.selector) return a.selector.localeCompare(b.selector);
  return a.context.localeCompare(b.context);
});

const reportDir = path.join(pkgRoot, 'dist-reports');
await mkdir(reportDir, { recursive: true });

const jsonPath = path.join(reportDir, 'css-duplicate-selectors.json');
await writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), duplicates }, null, 2));

const mdLines = [];
mdLines.push(`# CSS duplicate selectors report`);
mdLines.push(``);
mdLines.push(`Generated: ${new Date().toISOString()}`);
mdLines.push(`Scanned: ${cssFiles.length} files under src/**/*.css`);
mdLines.push(`Duplicates: ${duplicates.length}`);
mdLines.push(``);

for (const d of duplicates) {
  mdLines.push(`## \`${d.selector}\``);
  mdLines.push(`- Context: \`${d.context}\``);
  mdLines.push(`- Occurrences: ${d.count}`);
  mdLines.push(`- Identical declarations: ${d.identicalDecls ? 'yes' : 'no'}`);
  mdLines.push(``);
  for (const o of d.occurrences) {
    mdLines.push(`- ${o.file}:${o.line ?? '?'}`);
  }
  mdLines.push(``);
}

const mdPath = path.join(reportDir, 'css-duplicate-selectors.md');
await writeFile(mdPath, mdLines.join('\n'));

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);


