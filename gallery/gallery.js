import { enhance, notify, openDialog, closeDialog, paginate, createFilterGroup, createSelect } from '../dist/b5-ui.js';

enhance(document);

const $ = id => document.getElementById(id);
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function badge(label, tone) {
  const element = node('span', 'b5-ribbon', label);
  if (tone) element.dataset.tone = tone;
  return element;
}
function metadata(entries) {
  const list = node('dl', 'b5-kv');
  for (const [label, value] of entries) {
    const pair = node('div');
    pair.append(node('dt', '', label), node('dd', '', String(value)));
    list.append(pair);
  }
  return list;
}
function showDetails(title, content, trigger) {
  $('detail-title').textContent = title;
  $('detail-body').replaceChildren(...content);
  openDialog($('detail-drawer'), { trigger });
}

document.querySelectorAll('[data-demo-notify]').forEach(button => {
  button.addEventListener('click', () => notify(button.dataset.demoNotify, { tone: 'success' }));
});
$('notify-demo').addEventListener('click', () => notify('One familiar interface, wherever you build.', { tone: 'success' }));
$('dialog-save').addEventListener('click', () => {
  closeDialog($('example-dialog'), 'example-complete');
  notify('Example action complete.', { tone: 'success' });
});
$('density-toggle').addEventListener('click', event => {
  const button = event.currentTarget;
  const compact = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(compact));
  if (compact) document.body.dataset.b5Density = 'compact';
  else delete document.body.dataset.b5Density;
});

const lobbies = [
  { name: 'Westside Freeburn', host: 'Driver 01', players: 5, location: 'Downtown Paradise' },
  { name: 'Coast road crew', host: 'Driver 02', players: 4, location: 'Ocean View' },
  { name: 'Meet at the stadium', host: 'Driver 03', players: 8, location: 'Big Surf Island' }
];
let directoryFilter = 'all';
$('example-roster').setAttribute('role', 'region');
$('example-roster').setAttribute('aria-label', 'Sample player roster');
function lobbyCard(lobby) {
  const card = node('article', 'b5-lobby');
  const header = node('div', 'b5-lobby__header');
  const identity = node('div');
  const meta = node('div', 'b5-lobby__meta');
  meta.append(node('span', 'b5-lobby__mode', 'Freeburn'), node('span', '', '·'), node('span', '', `Hosted by ${lobby.host}`));
  identity.append(node('h4', 'b5-lobby__title', lobby.name), meta);
  const capacity = node('div', 'b5-lobby__capacity');
  const status = node('span', 'b5-status b5-status--caps', lobby.players < 8 ? 'Open slots' : 'Full');
  if (lobby.players < 8) status.dataset.tone = 'success';
  const seats = node('div', 'b5-lobby__seats', `${lobby.players} `);
  seats.append(node('small', '', '/ 8 players'));
  capacity.append(status, seats);
  header.append(identity, capacity);
  const members = node('div', 'b5-lobby__members');
  const member = node('span', 'b5-member');
  const avatar = node('span', 'b5-avatar', lobby.host.slice(-2)); avatar.setAttribute('aria-hidden', 'true');
  const host = node('span', 'b5-member__host', '★'); host.title = 'Lobby host';
  member.append(avatar, node('span', '', lobby.host), host);
  members.append(member, node('span', 'b5-hint', `+ ${lobby.players - 1} example crew members`));
  card.append(header, members);
  return card;
}
function directoryEmpty(title, description, reset = false) {
  const element = node('div', 'b5-empty b5-empty--illustrated');
  const symbol = node('span', 'b5-empty__symbol'); symbol.setAttribute('aria-hidden', 'true');
  const action = node(reset ? 'button' : 'a', 'b5-link', reset ? 'Clear filters ↗' : 'Get connected ↗');
  if (reset) {
    action.type = 'button';
    action.addEventListener('click', () => { $('example-lobby-search').value = ''; directoryFilter = 'all'; createFilterGroup($('example-lobby-filters')).select('all', { emit: false }); renderDirectory(); $('example-lobby-search').focus(); });
  } else action.href = '#connect-example';
  element.append(symbol, node('h4', 'b5-heading', title), node('p', '', description), action);
  return element;
}
function renderDirectory() {
  const state = $('directory-example-state').value;
  const empty = state === 'empty';
  const loading = state === 'loading';
  const query = $('example-lobby-search').value.trim().toLocaleLowerCase();
  const available = empty || loading ? [] : lobbies;
  const matching = available.filter(lobby => (directoryFilter !== 'space' || lobby.players < 8) && `${lobby.name} ${lobby.host} ${lobby.location}`.toLocaleLowerCase().includes(query));
  const totalPlayers = available.reduce((sum, lobby) => sum + lobby.players, 0);
  $('example-player-count').textContent = loading ? '—' : String(totalPlayers);
  $('example-lobby-count').textContent = loading ? '—' : String(available.length);
  $('example-all-count').textContent = String(available.length);
  $('example-space-count').textContent = String(available.filter(lobby => lobby.players < 8).length);
  $('example-roster-count').textContent = loading ? '—' : String(totalPlayers);
  $('example-roster-count-label').textContent = state === 'stale' ? 'Last seen' : loading ? 'Loading' : 'Online';
  $('example-roster-status').textContent = state === 'stale' ? 'Last snapshot' : loading ? 'Waiting for snapshot' : empty ? 'Roads are quiet' : 'Snapshot ready';
  const rosterTone = state === 'stale' ? 'danger' : loading ? 'warning' : empty ? '' : 'success';
  if (rosterTone) $('example-roster-status').dataset.tone = rosterTone;
  else delete $('example-roster-status').dataset.tone;
  $('example-stale').hidden = state !== 'stale';
  $('online-example-status').textContent = state === 'stale' ? 'Example connection lost' : loading ? 'Loading example' : 'Example server online';
  $('online-example-status').dataset.tone = state === 'stale' ? 'danger' : loading ? 'warning' : 'success';
  if (loading) {
    const skeleton = node('div', 'b5-loading'); skeleton.setAttribute('role', 'status');
    const title = node('span', 'b5-skeleton b5-skeleton--title'); title.setAttribute('aria-hidden', 'true');
    const line = node('span', 'b5-skeleton'); line.setAttribute('aria-hidden', 'true');
    skeleton.append(title, line, node('p', 'b5-hint', 'Getting the example snapshot…'));
    $('lobby-examples').replaceChildren(skeleton);
  } else if (empty) $('lobby-examples').replaceChildren(directoryEmpty('Open roads. Your move.', 'No lobbies right now. Host a Freeburn session in-game and it will appear here.'));
  else if (!matching.length) $('lobby-examples').replaceChildren(directoryEmpty('No matching lobbies', 'Try another name or clear your filters.', true));
  else $('lobby-examples').replaceChildren(...matching.map(lobbyCard));
  const people = available.flatMap(lobby => Array.from({ length: lobby.players }, (_, index) => ({ name: index ? `${lobby.host} crew ${index}` : lobby.host, host: index === 0 })));
  $('example-roster').classList.toggle('b5-roster__list', people.length > 0);
  $('example-roster').classList.toggle('b5-roster__list--scroll', people.length > 0);
  if (people.length) $('example-roster').tabIndex = 0;
  else $('example-roster').removeAttribute('tabindex');
  if (loading) {
    const skeleton = node('div', 'b5-loading'); skeleton.setAttribute('role', 'status');
    for (let index = 0; index < 3; index++) {
      const row = node('span', 'b5-skeleton'); row.setAttribute('aria-hidden', 'true'); skeleton.append(row);
    }
    skeleton.append(node('p', 'b5-hint', 'Waiting for the directory…'));
    $('example-roster').replaceChildren(skeleton);
  } else if (!people.length) {
    $('example-roster').replaceChildren(node('div', 'b5-roster__empty', 'A quiet moment in Paradise.\nBe the first to hit the road.'));
  } else $('example-roster').replaceChildren(...people.map((player, index) => {
    const row = node('div', 'b5-person');
    const avatar = node('span', 'b5-avatar', String(index + 1).padStart(2, '0')); avatar.setAttribute('aria-hidden', 'true'); avatar.dataset.color = ['red', 'gold', 'green', 'blue'][index % 4];
    const body = node('div', 'b5-person__body'); body.append(node('div', 'b5-person__name', player.name), node('div', 'b5-person__meta', player.host ? 'Hosting a lobby' : 'In a lobby'));
    row.append(avatar, body); if (player.host) row.append(node('span', 'b5-person__role', 'HOST'));
    return row;
  }));
}
$('example-lobby-filters').addEventListener('b5:filterchange', event => { directoryFilter = event.detail.value; renderDirectory(); });
$('example-lobby-search').addEventListener('input', renderDirectory);
$('directory-example-state').addEventListener('change', renderDirectory);
$('refresh-example').addEventListener('click', async event => {
  const button = event.currentTarget; button.disabled = true; button.setAttribute('aria-busy', 'true');
  await new Promise(resolve => setTimeout(resolve, 450));
  renderDirectory(); button.disabled = false; button.removeAttribute('aria-busy');
  $('example-refreshed').textContent = 'Example snapshot refreshed just now. These sessions are illustrative.';
  notify('Example directory refreshed.', { tone: 'success' });
});
renderDirectory();

const units = [
  { name: 'BrnCamera.cpp', status: 'done', functions: 87 },
  { name: 'BrnGame.cpp', status: 'active', functions: 241 },
  { name: 'BrnLobby.cpp', status: 'active', functions: 64 },
  { name: 'BrnMenu.cpp', status: 'queued', functions: 112 },
  { name: 'BrnOnline.cpp', status: 'blocked', functions: 53 },
  { name: 'BrnTraffic.cpp', status: 'queued', functions: 158 },
  { name: 'BrnVehicle.cpp', status: 'done', functions: 306 },
  { name: 'BrnWorld.cpp', status: 'queued', functions: 195 }
].map(unit => ({ ...unit, source: unit.name.includes('Online') ? 'platform' : 'game', goal: /Lobby|Online/.test(unit.name) ? 'online' : 'runtime' }));
const statuses = {
  done: { label: 'Completed', tone: 'success' }, active: { label: 'In progress', tone: 'warning' },
  queued: { label: 'Queued' }, blocked: { label: 'Blocked', tone: 'danger' }
};
let workPage = 1;
let workMode = 'units';
const sharedExplorer = node('div');
const workModes = $('work-modes');
for (const child of [...workModes.parentElement.children]) if (child !== workModes) sharedExplorer.append(child);
$('work-explorer').append(sharedExplorer);
workModes.addEventListener('b5:tabchange', event => {
  if (event.target !== workModes) return;
  workMode = event.detail.tab.id === 'work-fn-tab' ? 'functions' : event.detail.tab.id === 'work-build-tab' ? 'build' : 'units';
  event.detail.panel.append(sharedExplorer); workPage = 1;
  $('work-name-heading').textContent = workMode === 'functions' ? 'Function' : 'Translation unit';
  $('work-name-heading').closest('tr').children[2].textContent = workMode === 'functions' ? 'Address' : 'Functions';
  $('work-search').labels[0].querySelector('.b5-label').textContent = workMode === 'functions' ? 'Search functions' : 'Search translation units';
  $('work-sort').options[1].label = workMode === 'functions' ? 'Address' : 'Function count';
  renderWork();
});
function renderWork() {
  const query = $('work-search').value.trim().toLocaleLowerCase();
  const filter = $('work-filter').value;
  const sort = $('work-sort').value;
  const source = $('work-source').value;
  const goal = $('work-goal').value;
  const dataset = workMode === 'functions' ? units.map((unit, index) => ({ ...unit, name: `${unit.name.slice(0, -4)}::Update`, functions: 1, address: 0x82000000 + index * 0x120 })) : workMode === 'build' ? units.filter(unit => unit.status === 'done') : units;
  const matching = dataset.filter(unit => (!query || unit.name.toLocaleLowerCase().includes(query)) && (filter === 'all' || unit.status === filter) && (source === 'all' || unit.source === source) && (goal === 'all' || unit.goal === goal));
  matching.sort(sort === 'functions' ? (left, right) => workMode === 'functions' ? right.address - left.address : right.functions - left.functions : (left, right) => left.name.localeCompare(right.name));
  const result = paginate(matching, { page: workPage, pageSize: 5 });
  workPage = result.page;
  const rows = result.items.map(unit => {
    const row = node('tr');
    const name = node('td');
    const action = node('button', 'b5-table__action', unit.name);
    action.type = 'button';
    const inspectUnit = trigger => showDetails(unit.name, [
      badge(statuses[unit.status].label, statuses[unit.status].tone),
      node('p', 'b5-muted', 'An illustrative translation unit. This gallery contains no live decompilation or contributor data.'),
      metadata([['Functions', unit.functions], ['Status', statuses[unit.status].label], ['Source', 'Example dataset'], ['Interface', 'Shared detail drawer']]),
      node('pre', 'b5-code', `GameSource/Example/${unit.name}`)
    ], trigger);
    action.addEventListener('click', () => inspectUnit(action));
    name.append(action);
    const state = node('td');
    state.append(badge(statuses[unit.status].label, statuses[unit.status].tone));
    const inspect = node('td');
    const detailAction = node('button', 'b5-button b5-button--ghost', 'Inspect ↗');
    detailAction.type = 'button';
    detailAction.setAttribute('aria-label', `Inspect ${unit.name}`);
    detailAction.addEventListener('click', () => inspectUnit(detailAction));
    inspect.append(detailAction);
    row.append(name, state, node('td', 'b5-mono', workMode === 'functions' ? `0x${unit.address.toString(16).toUpperCase()}` : String(unit.functions)), inspect);
    return row;
  });
  if (!rows.length) {
    const row = node('tr');
    const cell = node('td');
    cell.colSpan = 4;
    const empty = node('div', 'b5-empty');
    const clear = node('button', 'b5-button', 'Clear filters');
    clear.type = 'button';
    clear.addEventListener('click', () => { $('work-search').value = ''; for (const id of ['work-filter', 'work-source', 'work-goal']) { $(id).value = 'all'; createSelect($(id)).refresh(); } workPage = 1; renderWork(); $('work-search').focus(); });
    empty.append(node('h3', '', 'No matching units'), node('p', '', 'Try another name or clear your filters.'), clear);
    cell.append(empty); row.append(cell); rows.push(row);
  }
  $('work-rows').replaceChildren(...rows);
  $('work-range').textContent = `${result.from}–${result.to} of ${result.total} ${workMode === 'functions' ? 'functions' : 'units'}`;
  $('work-page').textContent = `${result.page} / ${result.pageCount}`;
  $('work-prev').disabled = !result.hasPrevious;
  $('work-next').disabled = !result.hasNext;
}
for (const id of ['work-search', 'work-filter', 'work-sort', 'work-source', 'work-goal']) {
  $(id).addEventListener(id === 'work-search' ? 'input' : 'change', () => { workPage = 1; renderWork(); });
}
$('work-prev').addEventListener('click', () => { workPage--; renderWork(); });
$('work-next').addEventListener('click', () => { workPage++; renderWork(); });
renderWork();
$('work-build-preview').addEventListener('click', event => {
  const tree = node('div', 'b5-tree b5-tree--menu');
  const details = node('details'); details.open = true;
  const list = node('ul'); for (const file of ['b5-ui.css', 'b5-ui.js', 'select.js', 'pager.js', 'download.js', 'assets/']) list.append(node('li', '', file));
  details.append(node('summary', '', 'ui/'), list); tree.append(details);
  showDetails('Example build contents', [node('p', 'b5-hint', 'Illustrative files, not a downloadable game build.'), tree], event.currentTarget);
});

const navigation = [...document.querySelectorAll('.garage-nav a')];
const sections = [...document.querySelectorAll('.garage-section')];
let navigationScheduled = false;
function updateNavigation() {
  navigationScheduled = false;
  const current = sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .35).at(-1) ?? sections[0];
  for (const link of navigation) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
function scheduleNavigation() {
  if (!navigationScheduled) { navigationScheduled = true; requestAnimationFrame(updateNavigation); }
}
addEventListener('scroll', scheduleNavigation, { passive: true });
addEventListener('resize', scheduleNavigation);
updateNavigation();
