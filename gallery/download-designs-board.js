import { enhance } from '../dist/b5-ui.js';
import { downloadDesigns, renderDownloadDesign, sampleDownload } from '../dist/download-designs.js';

// Rows by kind, one panel per design, each under the hero's own line of context. The markup
// comes from the library's designs module, never from input or a remote service.
const board = document.getElementById('dd-board');
const groups = Map.groupBy(downloadDesigns, design => design.group);
for (const [group, designs] of groups) {
  const row = document.createElement('section');
  row.className = 'dd-row';
  const title = document.createElement('h2');
  title.textContent = group;
  const count = document.createElement('small');
  count.textContent = `${designs.length} variants`;
  title.append(' ', count);
  row.append(title);
  for (const design of designs) {
    const panel = document.createElement('article');
    panel.className = 'dd-panel';
    panel.id = `design-${design.id}`;
    const label = document.createElement('div');
    label.className = 'dd-panel__label';
    for (const [tag, text] of [['b', design.code], ['span', design.label], ['small', design.note]]) {
      const part = document.createElement(tag);
      part.textContent = text;
      label.append(part);
    }
    const kicker = document.createElement('div');
    kicker.className = 'dd-kicker';
    kicker.innerHTML = 'THE LATEST PC BUILD <em>■ Live</em>';
    const stage = document.createElement('div');
    renderDownloadDesign(stage, design.id, { prefix: `dd-${design.id}`, data: sampleDownload });
    panel.append(label, kicker, stage);
    row.append(panel);
  }
  board.append(row);
}
enhance(document);
