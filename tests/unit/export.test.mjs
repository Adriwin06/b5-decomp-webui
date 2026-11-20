import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { exportBuild } from '../../tools/export.mjs';

// Like the asset checks, these read the dist/ that `npm test` builds first.
async function folder(t) {
  const created = await mkdtemp(path.join(os.tmpdir(), 'b5-export-'));
  t.after(() => rm(created, { recursive: true, force: true }));
  return created;
}

test('export replaces an earlier export and keeps a submodule checkout linked', async t => {
  const target = await folder(t);
  const link = 'gitdir: ../../.git/modules/ui\n';
  await writeFile(path.join(target, '.git'), link);
  await writeFile(path.join(target, 'webui.json'), '{}');
  await writeFile(path.join(target, 'stale.js'), '');
  const manifest = await exportBuild(target, { rebuild: false });
  const entries = await readdir(target);
  assert.equal(await readFile(path.join(target, '.git'), 'utf8'), link);
  assert.ok(!entries.includes('stale.js'));
  for (const name of ['b5-ui.css', 'b5-ui.js', 'pager.js', 'select.js', 'download.js', 'assets', 'LICENSE', 'THIRD_PARTY.md']) {
    assert.ok(entries.includes(name), name);
  }
  assert.ok(!entries.some(name => name.endsWith('.d.ts')));
  const written = JSON.parse(await readFile(path.join(target, 'webui.json'), 'utf8'));
  assert.equal(written.name, 'b5-decomp-webui');
  assert.equal(written.version, manifest.version);
  assert.match(written.commit ?? '', /^[0-9a-f]{40}$/);
});

test('export refuses a folder that holds something other than an export', async t => {
  const target = await folder(t);
  await writeFile(path.join(target, 'index.html'), '');
  await assert.rejects(exportBuild(target, { rebuild: false }), /holds no previous export/);
  assert.deepEqual(await readdir(target), ['index.html']);
});
