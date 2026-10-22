import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { build, root } from './build.mjs';

const watching = process.argv.includes('--watch');
if (watching) await build();
const port = Number(process.env.PORT ?? 4175);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.md': 'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/') { response.writeHead(302, { Location: '/gallery/' }); response.end(); return; }
    if (pathname.split(/[\\/]/).some(part => part.startsWith('.') || part === 'node_modules')) throw new Error('Not public');
    let target = path.resolve(root, `.${pathname}`);
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const actual = await realpath(target);
    if (!actual.startsWith(root)) throw new Error('Outside repository');
    if (path.relative(root, actual).split(path.sep).some(part => part.startsWith('.') || part === 'node_modules')) throw new Error('Not public');
    const body = await readFile(actual);
    response.writeHead(200, {
      'Content-Type': types[path.extname(actual)] ?? 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/gallery/`));

const watchers = [];
if (watching) {
  let timer;
  let pending = Promise.resolve();
  for (const folder of ['src', 'tokens', 'assets']) {
    watchers.push(watch(path.join(root, folder), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => { pending = pending.then(build).catch(error => console.error(error.message)); }, 120);
    }));
  }
}
function stop() { for (const watcher of watchers) watcher.close(); server.close(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
