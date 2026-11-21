import { enhance, notify, closeDialog, createFilterGroup, renderSparkline } from '../dist/b5-ui.js';
import { components, person } from './catalog-data.js';

const $ = id => document.getElementById(id);
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

// Markup below is imported from the repository's trusted specimen module,
// never from user input, a remote service, or a query parameter.
for (const [index, component] of components.entries()) {
  const article = node('article', `catalog-card${component.wide ? ' catalog-card--wide' : ''}`);
  article.id = component.id;
  article.dataset.category = component.category;
  const header = node('header', 'catalog-card__header');
  const heading = node('h2', '', component.title);
  heading.id = `catalog-heading-${component.id}`;
  article.setAttribute('aria-labelledby', heading.id);
  header.append(node('span', 'b5-eyebrow', `${String(index + 1).padStart(2, '0')} / ${component.category.toUpperCase()}`), heading, node('p', '', component.summary));
  if (component.action) {
    const action = node('button', 'b5-link', component.action.label);
    action.type = 'button'; action.id = component.action.id; header.append(action);
  }
  const demo = node('div', `catalog-demo${component.flush ? ' catalog-demo--flush' : ''}`);
  demo.innerHTML = component.markup;
  const source = node('details', 'catalog-source');
  const pre = node('pre', 'b5-code');
  const code = node('code');
  code.id = `catalog-source-${component.id}`;
  code.textContent = [component.markup.trim(), ...(component.sourceIds ?? []).map(id => $(id).outerHTML)].join('\n\n');
  pre.append(code);
  const copy = node('button', 'b5-button b5-button--ghost', 'Copy markup ⧉');
  copy.type = 'button'; copy.dataset.b5Copy = code.id;
  source.append(node('summary', '', 'Markup & API'), copy, pre);
  if (component.api) {
    const api = node('pre', 'b5-code'); api.append(node('code', '', component.api)); source.append(api);
  }
  article.append(header, demo, source);
  $('catalog-grid').append(article);
}

enhance(document);
$('catalog-total').textContent = `${components.length} component families`;
let category = 'all';
function filterCatalog() {
  const query = $('catalog-search').value.trim().toLocaleLowerCase();
  let shown = 0;
  for (const component of components) {
    const matches = (category === 'all' || component.category === category) && `${component.title} ${component.summary} ${component.keywords}`.toLocaleLowerCase().includes(query);
    $(component.id).hidden = !matches;
    if (matches) shown++;
  }
  $('catalog-result-count').textContent = `${shown} of ${components.length} component families`;
  $('catalog-empty').hidden = shown !== 0;
}
$('catalog-search').addEventListener('input', filterCatalog);
$('catalog-categories').addEventListener('b5:filterchange', event => { category = event.detail.value; filterCatalog(); });
$('catalog-clear').addEventListener('click', () => {
  $('catalog-search').value = ''; category = 'all';
  createFilterGroup($('catalog-categories')).select('all', { emit: false });
  filterCatalog(); $('catalog-search').focus();
});
filterCatalog();

$('density-toggle').addEventListener('click', event => {
  const compact = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(compact));
  if (compact) document.body.dataset.b5Density = 'compact'; else delete document.body.dataset.b5Density;
});
$('catalog-status').addEventListener('change', event => { $('catalog-select-state').textContent = `Current status value: ${event.target.value}`; });
$('catalog-lobby-filters').addEventListener('b5:filterchange', event => { $('catalog-filter-state').textContent = `Selected: ${event.detail.value}`; });
$('catalog-download-skin').addEventListener('change', event => { $('catalog-download').dataset.skin = event.target.value; });
document.querySelectorAll('[data-demo-toast]').forEach(button => button.addEventListener('click', () => notify(`${button.textContent.trim()}: shared notification example.`, { tone: button.dataset.demoToast })));
$('catalog-save-settings').addEventListener('click', () => {
  closeDialog($('catalog-modal'), 'example-saved'); notify('Example settings action completed.', { tone: 'success' });
});
$('catalog-refresh').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true; button.setAttribute('aria-busy', 'true');
  await new Promise(resolve => setTimeout(resolve, 450));
  button.disabled = false; button.removeAttribute('aria-busy');
  $('catalog-refresh-result').textContent = 'Example refreshed just now. No live server was contacted.';
});
let populated = false;
const emptyRoster = $('catalog-roster-content').innerHTML;
$('catalog-roster-toggle').addEventListener('click', event => {
  populated = !populated;
  $('catalog-roster-content').classList.toggle('b5-roster__empty', !populated);
  $('catalog-roster-content').classList.toggle('b5-roster__list', populated);
  if (populated) {
    $('catalog-roster-content').setAttribute('role', 'region');
    $('catalog-roster-content').setAttribute('aria-label', 'Sample player roster');
    $('catalog-roster-content').tabIndex = 0;
  } else {
    for (const attribute of ['role', 'aria-label', 'tabindex']) $('catalog-roster-content').removeAttribute(attribute);
  }
  $('catalog-roster-content').innerHTML = populated ? person('D1', 'Driver 01', 'Hosting a lobby', '', 'HOST') + person('D2', 'Driver 02', 'In a lobby', 'gold') : emptyRoster;
  $('catalog-roster-count').textContent = populated ? '2' : '0';
  event.currentTarget.textContent = populated ? 'Show empty state ↗' : 'Show populated state ↗';
});
renderSparkline($('catalog-sparkline'), [2, 5, 3, 8, 4, 9, 7, 12, 6, 8, 14, 10], { label: 'Example contributions by day' });

const drawerBody = $('catalog-drawer-body');
const drawerOriginal = [...drawerBody.childNodes];
function restoreDrawer() {
  $('catalog-detail-kind').textContent = 'Example unit';
  $('catalog-detail-title').textContent = 'BrnCamera.cpp';
  drawerBody.replaceChildren(...drawerOriginal);
  $('catalog-detail-back').hidden = true;
}
$('catalog-nested-open').addEventListener('click', () => {
  $('catalog-detail-kind').textContent = 'Example function';
  $('catalog-detail-title').textContent = 'ExampleCamera::Update';
  drawerBody.replaceChildren(node('p', 'b5-muted', 'An example function view, rendered by the application inside the shared drawer.'), node('pre', 'b5-code', 'ExampleCamera::Update(float deltaTime)'));
  $('catalog-detail-back').hidden = false;
  $('catalog-detail-title').focus();
});
$('catalog-detail-back').addEventListener('click', () => { restoreDrawer(); $('catalog-nested-open').focus(); });
$('catalog-detail-drawer').addEventListener('close', restoreDrawer);

try {
  const response = await fetch('../dist/assets/provenance.json');
  if (!response.ok) throw new Error('Artwork manifest unavailable');
  const manifest = await response.json();
  for (const [index, asset] of manifest.filter(asset => /\.(png|webp)$/.test(asset.file)).entries()) {
    const button = node('button', 'catalog-asset');
    button.type = 'button'; button.dataset.b5Copy = `asset-path-${index}`; button.setAttribute('aria-label', `Copy asset path for ${asset.file}`);
    const preview = node('img'); preview.src = `../dist/assets/${asset.file}`; preview.alt = ''; preview.width = 180; preview.height = 90; preview.loading = 'lazy';
    const value = node('code', 'b5-sr-only', `./assets/${asset.file}`); value.id = `asset-path-${index}`;
    button.append(preview, node('span', '', asset.file), value);
    $('catalog-artwork').append(button);
  }
} catch (error) {
  $('catalog-artwork').append(node('p', 'b5-hint', error.message));
}
document.body.dataset.catalogReady = 'true';
if (location.hash) {
  try { const target = $(decodeURIComponent(location.hash.slice(1))); if (target?.matches('.catalog-card')) target.scrollIntoView(); } catch { /* Ignore malformed fragment identifiers. */ }
}
