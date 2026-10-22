import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Level the PNG in its own coordinates, before CSS stretches it for a label.
// A fixed CSS rotation after stretching changes the angle with the label's width.
// This wrapper keeps the original bitmap bytes and the transparent grunge edges.
const source = new URL('../assets/banner-red.png', import.meta.url);
const bytes = await readFile(source);
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 489 || height !== 152) throw new Error('Recalibrate the paint wrapper for the new source texture.');
const hash = createHash('sha256').update(bytes).digest('hex');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 489 136" preserveAspectRatio="none">
  <metadata>Burnout Paradise artwork; see THIRD_PARTY.md. Source: banner-red.png; SHA-256: ${hash}. Geometry only: cancel the native 0.082 rise before resizing.</metadata>
  <image width="489" height="152" transform="matrix(1 -0.082 0 1 0 0)" href="data:image/png;base64,${bytes.toString('base64')}"/>
</svg>\n`;
await writeFile(new URL('../assets/banner-red-level.svg', import.meta.url), svg);
