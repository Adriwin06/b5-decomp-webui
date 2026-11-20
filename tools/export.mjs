// Build the distribution and copy it into a folder.
//
//   node tools/export.mjs <destination> [--types]
//
// The destination receives dist/ as-is (TypeScript declarations only with --types)
// plus webui.json, which records the version and commit the copy was built from.
// `npm run release` commits this same output to the dist branch, which the sites
// check out as a git submodule. Exporting into a site's submodule tries unreleased
// changes there; the checkout's .git link is kept.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, root } from './build.mjs';

const git = (...command) => {
  try { return execFileSync('git', command, { cwd: root, encoding: 'utf8' }).trim(); } catch { return null; }
};
// A submodule or worktree checkout links to its repository through .git.
const kept = entry => entry === '.git';

/** Replace `destination` with the distribution and return its webui.json manifest. */
export async function exportBuild(destination, { types = false, rebuild = true } = {}) {
  const target = path.resolve(destination);
  if (target === root || root.startsWith(target + path.sep) || target.startsWith(path.join(root, 'dist'))) {
    throw new Error('Refusing to export into this repository.');
  }
  // Only replace a folder that is empty or holds a previous export.
  if (existsSync(target)) {
    const entries = (await readdir(target)).filter(entry => !kept(entry));
    if (entries.length && !entries.includes('webui.json')) {
      throw new Error(`${target} is not empty and holds no previous export (webui.json); not replacing it.`);
    }
  }
  if (rebuild) await build();
  const { name, version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const commit = git('rev-parse', 'HEAD');
  const dirty = Boolean(git('status', '--porcelain'));

  await mkdir(target, { recursive: true });
  for (const entry of await readdir(target)) {
    if (!kept(entry)) await rm(path.join(target, entry), { recursive: true, force: true });
  }
  await cp(path.join(root, 'dist'), target, {
    recursive: true,
    filter: source => types || !source.endsWith('.d.ts')
  });
  const manifest = { name, version, commit, dirty, source: 'https://github.com/Adriwin06/b5-decomp-webui' };
  await writeFile(path.join(target, 'webui.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { ...manifest, target };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const destination = args.find(arg => !arg.startsWith('--'));
  if (!destination) {
    console.error('Usage: node tools/export.mjs <destination> [--types]');
    process.exit(2);
  }
  const { name, version, commit, dirty, target } = await exportBuild(destination, { types: args.includes('--types') });
  console.log(`Exported ${name} v${version} (${commit ? commit.slice(0, 9) : 'unknown commit'}${dirty ? ', uncommitted changes' : ''}) -> ${target}`);
}
