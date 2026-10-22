import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { compileTokens, root } from '../../tools/build.mjs';
import path from 'node:path';

test('theme emits interoperable semantic values and resolves inherited types', async () => {
  const tokens = JSON.parse(await readFile(path.join(root, 'tokens/paradise.tokens.json'), 'utf8'));
  const css = compileTokens(tokens);
  assert.match(css, /--b5-color-accent: #d52630;/);
  assert.match(css, /--b5-color-focus: #edbd54;/);
  assert.match(css, /--b5-control-height: 44px;/);
  assert.match(css, /--b5-font-display: "B5 Anton", "Impact", "Arial Narrow", sans-serif;/);
});
test('broken and circular references fail instead of emitting invalid CSS', () => {
  assert.throws(() => compileTokens({ a: { $value: '{missing}' } }), /Unknown token reference/);
  assert.throws(() => compileTokens({ a: { $value: '{b}' }, b: { $value: '{a}' } }), /Circular token reference/);
});
test('names cannot escape declarations or collide when flattened', () => {
  assert.throws(() => compileTokens({ 'bad;name': { $value: 'x' } }), /Invalid token name/);
  const value = { $type: 'dimension', $value: { value: 1, unit: 'px' } };
  assert.throws(() => compileTokens({ 'a-b': { c: value }, a: { 'b-c': value } }), /CSS token name collision/);
});
test('unsupported color spaces and malformed values fail early', () => {
  assert.throws(() => compileTokens({ a: { $type: 'color', $value: { colorSpace: 'display-p3', components: [1, 0, 0] } } }), /sRGB/);
  assert.throws(() => compileTokens({ a: { $type: 'duration', $value: { value: 10, unit: 'px' } } }), /Invalid duration/);
  assert.throws(() => compileTokens({ a: { $type: 'fontFamily', $value: ['bad; font'] } }), /Invalid font family/);
});
test('all imported assets retain their provenance hashes and are shipped unchanged', async () => {
  const manifest = JSON.parse(await readFile(path.join(root, 'assets/provenance.json'), 'utf8'));
  const imported = (await readdir(path.join(root, 'assets'))).filter(file => /\.(png|webp|ttf)$/.test(file) || /-OFL\.txt$/.test(file));
  assert.deepEqual(manifest.map(asset => asset.file).sort(), imported.sort());
  assert.equal(new Set(manifest.map(asset => asset.file)).size, manifest.length);
  for (const { file, source, sha256 } of manifest) {
    assert.match(source, /^(b5-decomp-server\/web\/assets|BP-work-server\/bp_work_server\/static\/img\/ui|https:\/\/raw\.githubusercontent\.com\/google\/fonts\/main\/ofl\/oswald)\//);
    const contents = await readFile(path.join(root, 'assets', file));
    assert.equal(createHash('sha256').update(contents).digest('hex'), sha256, file);
    assert.deepEqual(await readFile(path.join(root, 'dist/assets', file)), contents);
  }
  const notice = await readFile(path.join(root, 'dist/THIRD_PARTY.md'), 'utf8');
  assert.match(notice, /not\s+covered by the framework's MIT license/);
  const leveled = await readFile(path.join(root, 'assets/banner-red-level.svg'), 'utf8');
  const embedded = leveled.match(/href="data:image\/png;base64,([^"]+)"/);
  assert.ok(embedded, 'The leveled paint must retain its original bitmap.');
  assert.deepEqual(Buffer.from(embedded[1], 'base64'), await readFile(path.join(root, 'assets/banner-red.png')));
  assert.equal(await readFile(path.join(root, 'dist/assets/banner-red-level.svg'), 'utf8'), leveled);
});
