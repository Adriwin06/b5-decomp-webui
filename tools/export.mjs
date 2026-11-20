// Build the distribution and copy it into a consuming project's static folder.
//
//   node tools/export.mjs <destination> [--types]
//
// The destination receives dist/ as-is (TypeScript declarations only with --types)
// plus webui.json, which records the version and commit the copy was built from.
// Consumers commit the result; nothing here runs at their build or run time.
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { build, root } from './build.mjs';

const args = process.argv.slice(2);
const destination = args.find(arg => !arg.startsWith('--'));
if (!destination) {
  console.error('Usage: node tools/export.mjs <destination> [--types]');
  process.exit(2);
}
const target = path.resolve(destination);
if (target === root || root.startsWith(target + path.sep) || target.startsWith(path.join(root, 'dist'))) {
  throw new Error('Refusing to export into this repository.');
}
// Only replace a folder that is empty or holds a previous export.
if (existsSync(target)) {
  const entries = await readdir(target);
  if (entries.length && !entries.includes('webui.json')) {
    throw new Error(`${target} is not empty and holds no previous export (webui.json); not replacing it.`);
  }
}

await build();
const git = (...command) => {
  try { return execFileSync('git', command, { cwd: root, encoding: 'utf8' }).trim(); } catch { return null; }
};
const { name, version } = JSON.parse(execFileSync(process.execPath, ['-p', 'JSON.stringify(require("./package.json"))'], { cwd: root, encoding: 'utf8' }));
const commit = git('rev-parse', 'HEAD');
const dirty = Boolean(git('status', '--porcelain'));

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
const withTypes = args.includes('--types');
await cp(path.join(root, 'dist'), target, {
  recursive: true,
  filter: source => withTypes || !source.endsWith('.d.ts')
});
const manifest = { name, version, commit, dirty, source: 'https://github.com/Adriwin06/b5-decomp-webui' };
await writeFile(path.join(target, 'webui.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Exported ${name} v${version} (${commit ? commit.slice(0, 9) : 'unknown commit'}${dirty ? ', uncommitted changes' : ''}) -> ${target}`);
