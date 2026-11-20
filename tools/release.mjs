// Commit a build to the dist branch, which the sites check out as a git submodule.
//
//   npm run release
//   git push origin dist
//
// The branch holds only the distribution, exactly what `npm run export` writes
// (webui.json included), one commit per release on top of the published branch.
// The working tree must be clean: each build records the commit it came from.
// Nothing here touches the working tree or the checked-out branch.
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { root } from './build.mjs';
import { exportBuild } from './export.mjs';

const branch = 'dist';
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
const quiet = (args, options = {}) => {
  try { return git(args, { stdio: ['ignore', 'pipe', 'ignore'], ...options }); } catch { return null; }
};

if (git(['status', '--porcelain'])) {
  console.error('Commit or stash your changes first: a release records the commit it was built from.');
  process.exit(1);
}
// Build on the published branch when there is one, else on a local one, else start it.
quiet(['fetch', '--quiet', 'origin', `+refs/heads/${branch}:refs/remotes/origin/${branch}`]);
const parent = quiet(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${branch}^{commit}`])
  ?? quiet(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}^{commit}`]);

const temp = await mkdtemp(path.join(os.tmpdir(), 'b5-webui-release-'));
try {
  const tree = path.join(temp, 'tree');
  const manifest = await exportBuild(tree);
  const gitDir = git(['rev-parse', '--absolute-git-dir']);
  // Stage the export in a scratch index. This repository's .gitattributes applies, so
  // text is stored normalized and assets byte-exact, as they are here; --force keeps
  // personal ignore rules from dropping a built file.
  const env = { ...process.env, GIT_INDEX_FILE: path.join(temp, 'index') };
  const attributes = path.join(root, '.gitattributes').split(path.sep).join('/');
  git(['-c', `core.attributesFile=${attributes}`, '--git-dir', gitDir, '--work-tree', tree, 'add', '--all', '--force', '.'], { cwd: tree, env });
  const treeId = git(['--git-dir', gitDir, 'write-tree'], { env });
  const short = manifest.commit.slice(0, 9);
  if (parent && git(['rev-parse', `${parent}^{tree}`]) === treeId) {
    console.log(`${branch} already holds the build of ${short} (${parent.slice(0, 9)}).`);
  } else {
    const commit = git(['commit-tree', treeId, ...(parent ? ['-p', parent] : []),
      '-m', `${manifest.name} ${manifest.version} from ${short}`,
      '-m', `Built by npm run release from ${manifest.commit}.`]);
    git(['update-ref', `refs/heads/${branch}`, commit]);
    console.log(`Committed ${manifest.name} ${manifest.version} (${short}) to ${branch} as ${commit.slice(0, 9)}.`);
    console.log(`Publish it: git push origin ${branch}`);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
