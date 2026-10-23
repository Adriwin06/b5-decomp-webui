import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

// Intentionally supports the token types used by this library, rather than
// pretending to implement every feature of the DTCG interchange specification.
export function compileTokens(document) {
  const tokens = new Map();
  function visit(group, parts = [], inheritedType) {
    for (const [key, entry] of Object.entries(group)) {
      if (key.startsWith('$')) continue;
      if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Invalid token name: ${key}`);
      const names = [...parts, key];
      if (Object.hasOwn(entry, '$value')) {
        tokens.set(names.join('.'), { ...entry, $type: entry.$type ?? group.$type ?? inheritedType });
      } else visit(entry, names, group.$type ?? inheritedType);
    }
  }
  visit(document);
  const names = new Set();
  function resolve(name, chain = []) {
    if (chain.includes(name)) throw new Error(`Circular token reference: ${[...chain, name].join(' -> ')}`);
    const token = tokens.get(name);
    if (!token) throw new Error(`Unknown token reference: ${name}`);
    const value = token.$value;
    if (typeof value === 'string' && /^\{[^{}]+\}$/.test(value)) return resolve(value.slice(1, -1), [...chain, name]);
    switch (token.$type) {
      case 'color': {
        if (value.colorSpace !== 'srgb' || !Array.isArray(value.components) || value.components.length !== 3 ||
          value.components.some(n => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1) ||
          (value.alpha !== undefined && (!Number.isFinite(value.alpha) || value.alpha < 0 || value.alpha > 1))) {
          throw new Error(`Expected an sRGB color: ${name}`);
        }
        const hex = value.components.map(n => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
        const alpha = value.alpha === undefined || value.alpha === 1 ? '' : Math.round(value.alpha * 255).toString(16).padStart(2, '0');
        return `#${hex}${alpha}`;
      }
      case 'dimension':
      case 'duration': {
        const units = token.$type === 'dimension' ? ['px', 'rem'] : ['ms', 's'];
        if (!Number.isFinite(value.value) || !units.includes(value.unit)) throw new Error(`Invalid ${token.$type}: ${name}`);
        return `${value.value}${value.unit}`;
      }
      case 'fontFamily': {
        const fonts = Array.isArray(value) ? value : [value];
        if (!fonts.length || fonts.some(font => typeof font !== 'string' || !/^[a-zA-Z0-9 -]+$/.test(font))) throw new Error(`Invalid font family: ${name}`);
        const generics = ['serif', 'sans-serif', 'monospace', 'system-ui'];
        return fonts.map(font => generics.includes(font) ? font : JSON.stringify(font)).join(', ');
      }
      default: throw new Error(`Unsupported token type: ${token.$type} (${name})`);
    }
  }
  return [...tokens.keys()].map(name => {
    const property = `--b5-${name.replaceAll('.', '-')}`;
    if (names.has(property)) throw new Error(`CSS token name collision: ${property}`);
    names.add(property);
    return `    ${property}: ${resolve(name)};`;
  }).join('\n');
}

export async function build() {
  const output = path.join(root, 'dist');
  await mkdir(path.join(output, 'assets'), { recursive: true });
  const [tokens, css, paradise, packageText] = await Promise.all([
    readFile(path.join(root, 'tokens/paradise.tokens.json'), 'utf8'),
    readFile(path.join(root, 'src/styles.css'), 'utf8'),
    readFile(path.join(root, 'src/paradise.css'), 'utf8'),
    readFile(path.join(root, 'package.json'), 'utf8')
  ]);
  const { version } = JSON.parse(packageText);
  const banner = `/* b5-decomp-webui v${version} | Code: MIT | Artwork: see THIRD_PARTY.md */\n`;
  const tokenCss = `@layer b5.tokens, b5.base, b5.components, b5.utilities;\n@layer b5.tokens {\n  :where(.b5-ui) {\n${compileTokens(JSON.parse(tokens))}\n  }\n}\n`;
  await writeFile(path.join(output, 'b5-ui.css'), banner + tokenCss + css + '\n' + paradise);
  await copyFile(path.join(root, 'src/index.js'), path.join(output, 'b5-ui.js'));
  await copyFile(path.join(root, 'src/select.js'), path.join(output, 'select.js'));
  await copyFile(path.join(root, 'src/pager.js'), path.join(output, 'pager.js'));
  await copyFile(path.join(root, 'src/download.js'), path.join(output, 'download.js'));
  await copyFile(path.join(root, 'src/index.d.ts'), path.join(output, 'b5-ui.d.ts'));
  for (const entry of await readdir(path.join(root, 'assets'), { withFileTypes: true })) {
    if (entry.isFile()) await copyFile(path.join(root, 'assets', entry.name), path.join(output, 'assets', entry.name));
  }
  await copyFile(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'));
  await copyFile(path.join(root, 'THIRD_PARTY.md'), path.join(output, 'THIRD_PARTY.md'));
  console.log(`Built b5-decomp-webui v${version} -> dist/`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await build();
