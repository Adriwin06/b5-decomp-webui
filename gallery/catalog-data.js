// Trusted, repository-authored specimens. Product styling belongs in src/.
import { downloadDesigns } from './download-designs.js';

const icon = name => `<svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#${name}"></use></svg>`;
const ribbon = (text, tone = '') => `<span class="b5-ribbon"${tone ? ` data-tone="${tone}"` : ''}>${text}</span>`;
const person = (initials, name, detail, color = '', role = '') => `<div class="b5-person"><span class="b5-avatar"${color ? ` data-color="${color}"` : ''} aria-hidden="true">${initials}</span><div class="b5-person__body"><div class="b5-person__name">${name}</div><div class="b5-person__meta">${detail}</div></div>${role ? `<span class="b5-person__role">${role}</span>` : ''}</div>`;
const ring = (value, title, subtitle, tone = '') => `<div class="b5-panel b5-panel--ink b5-metric-card"><div class="b5-ring"${tone ? ` data-tone="${tone}"` : ''} data-b5-progress="${value}" aria-label="${title}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="b5-ring__track" cx="60" cy="60" r="52"></circle><circle class="b5-ring__fill" pathLength="100" cx="60" cy="60" r="52"></circle></svg><span class="b5-ring__label"><strong data-b5-progress-label>${value}%</strong><small>${subtitle}</small></span></div><div class="b5-metric-card__body"><strong>${title}</strong><small>Illustrative coverage</small></div></div>`;

export const components = [
  {
    id: 'counters', title: 'Slanted ribbons', category: 'data', wide: true,
    summary: 'Compact summaries, severity colors and gold paint labels.',
    keywords: 'findings no body case ids events callees asserts chips badges counts ribbon',
    markup: `<div class="b5-ribbons">${ribbon('149 findings', 'danger')}${ribbon('4 no body', 'danger')}${ribbon('3 case IDs', 'warning')}${ribbon('1 event', 'warning')}<span class="b5-ribbon b5-ribbon--muted">95 callees</span><span class="b5-ribbon b5-ribbon--muted">46 asserts</span></div>`
  },
  {
    id: 'menu-tabs', title: 'Menu tabs', category: 'controls', wide: true, flush: true,
    summary: 'Italic menu caps, the red paint on the chosen tab, and keyboard navigation.',
    keywords: 'translation units functions available in build tabs navigation angled paint',
    markup: `<div class="b5-tabs b5-tabs--menu">
  <div class="b5-tablist" role="tablist" aria-label="Explorer mode">
    <button class="b5-tab" id="catalog-tu-tab" type="button" role="tab" aria-controls="catalog-tu-panel" aria-selected="true">Translation units</button>
    <button class="b5-tab" id="catalog-fn-tab" type="button" role="tab" aria-controls="catalog-fn-panel">Functions</button>
    <button class="b5-tab" id="catalog-build-tab" type="button" role="tab" aria-controls="catalog-build-panel">Available in build</button>
  </div>
  <div class="b5-tabpanel" id="catalog-tu-panel" tabindex="0">Search and inspect translation units.</div>
  <div class="b5-tabpanel" id="catalog-fn-panel" tabindex="0" hidden>Browse functions and their reconstruction status.</div>
  <div class="b5-tabpanel" id="catalog-build-panel" tabindex="0" hidden>Inspect the code available in a sample build.</div>
</div>`, api: 'enhance(root); // or createTabs(element)'
  },
  {
    id: 'dropdowns', title: 'Menu dropdowns', category: 'controls', wide: true,
    summary: 'Underlined like a field and painted while open; type-ahead, groups and native form values.',
    keywords: 'select dropdown listbox combobox filter all statuses all sources all goals brush native form',
    markup: `<div class="b5-row">
  <label class="b5-field"><span class="b5-sr-only">Status filter</span><select class="b5-select" data-b5-select id="catalog-status"><option value="all">All statuses</option><option value="queued">Queued</option><option value="active">In progress</option><option value="done">Completed</option><option value="blocked">Blocked</option></select></label>
  <label class="b5-field"><span class="b5-sr-only">Source filter</span><select class="b5-select" data-b5-select><option>All sources</option><optgroup label="Game"><option>GameSource</option><option>RenderWare</option></optgroup><optgroup label="Unavailable"><option disabled>Unimported source</option></optgroup></select></label>
  <label class="b5-field"><span class="b5-sr-only">Goal filter</span><select class="b5-select" data-b5-select><option>All goals</option><option>Online Freeburn</option><option>Playable build</option><option>World streaming</option></select></label>
</div><p id="catalog-select-state" class="b5-hint catalog-demo-note">Current status value: all</p>`,
    api: 'enhance(root); // or createSelect(nativeSelect)'
  },
  {
    id: 'destination', title: 'Paradise City artwork', category: 'identity', wide: true,
    summary: 'The logo composition, scribble, skyline, white label and copyable connection block.',
    keywords: 'paradise city logo artwork hero destination server connection copy address online skyline scribble',
    markup: `<div class="b5-destination">
  <div class="b5-destination__art" aria-hidden="true"><img class="b5-destination__logo" src="../dist/assets/paradise-city.webp" width="1000" height="540" alt=""><span class="b5-destination__label">Your city. Your playground.</span></div>
  <div class="b5-connection"><div class="b5-connection__top"><span class="b5-connection__kicker">THE WAY INTO PARADISE</span><span class="b5-status" data-tone="success">Server online</span></div><button class="b5-connection__address" type="button" data-b5-copy="catalog-server-address" aria-label="Copy example server address"><span id="catalog-server-address">online.decomp.adriwin.fr:27900</span>${icon('copy')}</button><span class="b5-hint">Copy the address. Meet your friends in-game.</span></div>
</div>`
  },
  {
    id: 'filters', title: 'Painted filter groups', category: 'controls',
    summary: 'Single selection, visible counts and a shared change event; a compact size for state filters.',
    keywords: 'all lobbies with space filter group segmented paint counts toggle compact states exact',
    markup: `<div class="b5-filter-group b5-filter-group--paint" id="catalog-lobby-filters" role="group" aria-label="Filter lobbies"><button class="b5-filter" type="button" data-b5-value="all" aria-pressed="true">All lobbies <span>0</span></button><button class="b5-filter" type="button" data-b5-value="space">With space <span>0</span></button></div><p id="catalog-filter-state" class="b5-hint catalog-demo-note">Selected: all</p>
<div class="b5-filter-group b5-filter-group--paint b5-filter-group--compact" id="catalog-state-filters" role="group" aria-label="Filter by state"><button class="b5-filter" type="button" data-b5-value="exact" aria-pressed="true">Exact match <span>1,284</span></button><button class="b5-filter" type="button" data-b5-value="fuzzy">Compiled, not matching <span>312</span></button><button class="b5-filter" type="button" data-b5-value="none">No compiled body <span>57</span></button></div>`,
    api: 'group.addEventListener("b5:filterchange", ({ detail }) => applyFilter(detail.value));'
  },
  {
    id: 'roster', title: 'Live roster panel', category: 'patterns',
    summary: 'The tilted gold masthead, a count tile, a quiet empty state and compact driver rows.',
    keywords: 'who driving players roster side panel gold header count empty populated',
    action: { id: 'catalog-roster-toggle', label: 'Show populated state ↗' },
    markup: `<aside class="b5-panel b5-panel--paint b5-roster" aria-labelledby="catalog-roster-title">
  <header class="b5-panel__header">
    <h3 id="catalog-roster-title">Who's driving</h3>
    <span class="b5-roster__count" role="status"><span class="b5-count-tile" id="catalog-roster-count">0</span><span>Online</span></span>
  </header>
  <div class="b5-panel__body">
    <p>Live from the streets of Paradise.</p>
    <div id="catalog-roster-content" class="b5-roster__empty">A quiet moment in Paradise.
Be the first to hit the road.</div>
  </div>
  <footer class="b5-panel__footer"><span class="b5-dot"></span>Community server / live roster</footer>
</aside>`
  },
  {
    id: 'empty-state', title: 'Illustrated empty states', category: 'feedback', wide: true,
    summary: 'A directional sign, skyline decoration and a clear next action.',
    keywords: 'empty state downtown sign open roads skyline get connected no lobbies updated refresh note',
    markup: `<div class="b5-stack"><div class="b5-empty b5-empty--illustrated"><span class="b5-empty__symbol" aria-hidden="true"></span><h3>Open roads. Your move.</h3><p>No lobbies right now. Host a Freeburn session in-game and it will appear here.</p><a class="b5-link" href="./examples.html#connect-example">Get connected ↗</a></div><div class="b5-directory-note"><span class="b5-dot" data-tone="success"></span><span>Updated 23:36:32</span><span class="b5-directory-note__aside">Refreshes every 5 seconds</span></div><div class="b5-empty b5-empty--illustrated"><span class="b5-empty__symbol b5-empty__symbol--diamond" aria-hidden="true"></span><h3>Engines off. Pick a unit.</h3><p>No one has work claimed right now. Claims from the queue show up here with their lease.</p><a class="b5-link" href="#empty-state">See the queue ↓</a></div></div>`
  },
  {
    id: 'search-refresh', title: 'Search & refresh', category: 'controls',
    summary: 'Quiet controls for a live directory or a dense developer view.',
    keywords: 'refresh busy loading icon search lobbies players field minimal toolbar',
    markup: `<div class="b5-section-header"><div class="b5-eyebrow">LIVE DIRECTORY</div><button id="catalog-refresh" class="b5-refresh" type="button">${icon('refresh')} Refresh</button></div><label class="b5-search">${icon('search')}<input class="b5-input" id="catalog-demo-search" type="search" aria-label="Search example lobbies or players" placeholder="Search lobbies or players"></label><p id="catalog-refresh-result" class="b5-hint catalog-demo-note" role="status">Ready to refresh the example.</p>`
  },
  {
    id: 'buttons', title: 'Action styles', category: 'controls',
    summary: 'Primary, quiet, menu, gold and paint treatments.',
    keywords: 'button action primary secondary ghost ink brush paint gold disabled busy loading',
    markup: `<div class="b5-stack">
  <div class="b5-row"><button class="b5-button b5-button--primary" type="button" data-demo-toast="success">Primary ↗</button><button class="b5-button" type="button" data-demo-toast="info">Secondary</button><button class="b5-button b5-button--ghost" type="button" data-demo-toast="info">Ghost</button></div>
  <div class="b5-row"><button class="b5-button b5-button--ink" type="button" data-demo-toast="info">Menu action</button><button class="b5-button b5-button--gold" type="button" data-demo-toast="success">Gold</button><button class="b5-button" type="button" disabled>Disabled</button></div>
  <div class="b5-row"><button class="b5-button b5-button--paint" type="button" data-demo-toast="success"><span class="b5-button__arrow" aria-hidden="true">↘</span> Find a lobby</button><button class="b5-button" type="button" disabled aria-busy="true">Connecting</button></div>
  <div class="b5-row"><button class="b5-button b5-button--paint b5-button--paint-gold" type="button" data-demo-toast="success">Gold paint</button><button class="b5-button b5-button--paint b5-button--paint-red" type="button" data-demo-toast="info">Red paint</button></div>
</div>`
  },
  {
    id: 'section-numbers', title: 'Section numbers & HUD corners', category: 'patterns',
    summary: 'A section\'s number, huge and hollow behind its header, and gold HUD corners round a map or chart.',
    keywords: 'section number index numbered header hollow outline hud frame corners brackets map chart',
    markup: `<div class="b5-section-header" data-b5-index="01"><div><div class="b5-eyebrow">THE WORK LEDGER / EVERY UNIT</div><h3 class="b5-heading">Progress map<span class="b5-accent">.</span></h3></div></div>
<div class="b5-hud catalog-hud"><p class="b5-muted">A map or chart in the HUD's gold corners.</p></div>`
  },
  {
    id: 'lobby-cards', title: 'Lobby cards', category: 'patterns',
    summary: 'Room identity, availability, capacity and member chips; the same surface as a plain card.',
    keywords: 'lobby session host capacity full open freeburn card members list queue summary',
    markup: `<article class="b5-lobby"><div class="b5-lobby__header"><div><h3 class="b5-lobby__title">Westside Freeburn</h3><div class="b5-lobby__meta"><span class="b5-lobby__mode">Freeburn</span><span>·</span><span>Hosted by Driver 01</span></div></div><div class="b5-lobby__capacity"><span class="b5-status b5-status--caps" data-tone="success">Open slots</span><div class="b5-lobby__seats">3 <small>/ 8 players</small></div></div></div><div class="b5-lobby__members"><span class="b5-member"><span class="b5-avatar" aria-hidden="true">D1</span><span>Driver 01</span><span class="b5-member__host" title="Lobby host">★</span></span><span class="b5-member"><span class="b5-avatar" data-color="gold" aria-hidden="true">D2</span><span>Driver 02</span></span><span class="b5-member"><span class="b5-avatar" data-color="blue" aria-hidden="true">D3</span><span>Driver 03</span></span></div></article>
<article class="b5-card b5-card--compact"><div class="b5-card__header"><h3 class="b5-card__title">Next queue</h3><span class="b5-ribbon b5-ribbon--gold">246 ready</span></div><p class="b5-muted">Any list or summary block, on the lobby card's surface.</p></article>`
  },
  {
    id: 'navigation', title: 'Brand & navigation', category: 'identity',
    summary: 'The city seal, numbered navigation and red selection marker.',
    keywords: 'site header brand seal navigation active numbered links red streak',
    markup: `<header class="b5-site-header"><a class="b5-brand" href="./examples.html"><img class="b5-brand__mark" src="../dist/assets/seal-paradise-city.png" width="54" height="54" alt=""><span>Burnout Paradise<span class="b5-brand__subtitle">DECOMP / COMMUNITY ONLINE</span></span></a><nav class="b5-site-nav" aria-label="Sample site"><a href="./examples.html#patterns" aria-current="page"><span>01</span> Live lobbies</a><a href="./examples.html#connect-example"><span>02</span> Get connected</a><a class="b5-site-nav__external" href="./examples.html#work-pattern">Decomp progress ↗</a></nav></header>`
  },
  {
    id: 'downloads', title: 'Download controls', category: 'controls', wide: true,
    summary: 'Build picker, download count and file preview, in every design: switch between the bars, the road signs, the plates and the billboards. Demo choices download sample documentation; sizes are illustrative.',
    keywords: 'download build full game update only package menu popover counter preview eye asphalt streak skyline tire burn torn split livery boost speed lines licence license plate odometer gauge tachometer rev needle cluster',
    markup: `<div class="catalog-design-stage" id="catalog-download-stage">${downloadDesigns[0].markup('catalog-download', 'catalog-build-dialog')}</div>
<div class="catalog-design-controls"><label class="b5-field catalog-design-picker"><span class="b5-label">Design</span><select class="b5-select" data-b5-select id="catalog-download-design"><optgroup label="Bar"><option value="cluster">X1 · Tachometer cluster (current)</option><option value="dashboard">X2 · Dashboard bar</option><option value="classic">X3 · Classic bar</option></optgroup><optgroup label="Road sign"><option value="sign">B1 · Guide sign</option><option value="sign-game">B2 · Paradise sign</option><option value="sign-exit">B3 · Exit only</option><option value="sign-route">B4 · Route shield</option></optgroup><optgroup label="Licence plate"><option value="plate-sunset">A1 · Sunset plate</option><option value="plate-paradise">A2 · Paradise plate</option><option value="plate-registration">A3 · Registration</option><option value="plate-night">A4 · Night plate</option></optgroup><optgroup label="Billboard"><option value="billboard">C1 · Billboard</option><option value="billboard-fire">C2 · Blast</option><option value="billboard-paint">C3 · Blast</option><option value="billboard-pasted">C4 · Pasted over</option></optgroup></select></label>
<label class="b5-field catalog-skin-picker"><span class="b5-label">Treatment</span><select class="b5-select" data-b5-select id="catalog-download-skin"><option value="tireburn">Tire burn</option><option value="asphalt">Asphalt</option><option value="streak">Crimson streak</option><option value="skyline">Paradise skyline</option><option value="torn">Torn poster</option><option value="split">Split livery</option></select></label>
<a class="b5-link catalog-design-all" href="./download-designs.html">All designs side by side ↗</a></div>`, source: downloadDesigns[0].markup('catalog-download', 'catalog-build-dialog'), sourceIds: ['catalog-build-dialog'], api: 'enhance(root); // or createDownloadMenu(group)'
  },
  {
    id: 'progress-rings', title: 'Progress rings', category: 'data', wide: true,
    summary: 'Shared red, gold and runtime-blue displays with accessible values.',
    keywords: 'ring radial circle progress percent translation units functions executable build runtime',
    markup: `<div class="b5-grid">${ring(63.7, 'Translation units', 'Matched')}${ring(41.2, 'Functions', 'Recovered', 'warning')}${ring(28.6, 'Executable', 'In build', 'info')}</div>`,
    api: 'setProgress(ringElement, 72.4);'
  },
  {
    id: 'license', title: 'License card, chip & meters', category: 'data',
    summary: 'A progress rank on a gold license card, with segmented meters that setProgress fills like the rings; the chip folds it into a header and opens it.',
    keywords: 'license rank class card chip header badge meters segmented bars progress percent stamp completion units functions build byte match popover',
    markup: `<div class="catalog-license">
  <button class="b5-license-chip" type="button"><span class="b5-license-chip__class">B</span><span class="b5-license-chip__rank">B-class license</span><span class="b5-license-chip__value">63.7%</span><span class="b5-sr-only"> of units complete</span></button>
  <article class="b5-license" aria-labelledby="catalog-license-rank">
    <div class="b5-license__head"><div><div class="b5-license__kicker">Paradise City · Decomp license</div><h3 class="b5-license__rank" id="catalog-license-rank">B-class license</h3></div><span class="b5-license__class" aria-hidden="true">B</span></div>
    <p class="b5-license__next">Next: A-class license at 80% · 214 units to go</p>
    <div class="b5-license__stats">
      <div class="b5-meter" data-tone="success" data-b5-progress="63.7" aria-label="Units complete"><span class="b5-meter__label">Units complete</span><span class="b5-meter__value" data-b5-progress-label>63.7%</span><span class="b5-meter__bar"></span></div>
      <div class="b5-meter" data-b5-progress="41.2" aria-label="Functions covered"><span class="b5-meter__label">Functions covered</span><span class="b5-meter__value" data-b5-progress-label>41.2%</span><span class="b5-meter__bar"></span></div>
      <div class="b5-meter" data-tone="info" data-b5-progress="28.6" aria-label="In the build"><span class="b5-meter__label">In the build</span><span class="b5-meter__value" data-b5-progress-label>28.6%</span><span class="b5-meter__bar"></span></div>
      <div class="b5-meter" data-tone="success" data-b5-progress="12.4" aria-label="X360 byte match"><span class="b5-meter__label">X360 byte match</span><span class="b5-meter__value" data-b5-progress-label>12.4%</span><span class="b5-meter__bar"></span></div>
    </div>
    <div class="b5-license__stamp"><span>Valid in Paradise City</span><span>No. 4fdad70c1e</span></div>
  </article>
</div>`,
    api: 'setProgress(meterElement, 63.7); // chip: popovertarget="licenseCard" data-b5-reveal, then toggle data-b5-shown'
  },
  {
    id: 'summary-tiles', title: 'Goal & status tiles', category: 'data',
    summary: 'Compact summary grids for goals, work queues and profiles.',
    keywords: 'goal active summary todo queued progress compiled done blocked counts metrics',
    markup: `<div class="b5-summary-grid"><div class="b5-summary"><strong>128</strong><span>Queued</span></div><div class="b5-summary" data-tone="info"><strong>12</strong><span>Active</span></div><div class="b5-summary" data-tone="warning"><strong>34</strong><span>Compiled</span></div><div class="b5-summary" data-tone="success"><strong>92</strong><span>Done</span></div><div class="b5-summary" data-tone="danger"><strong>4</strong><span>Blocked</span></div></div>`
  },
  {
    id: 'panel-treatments', title: 'Panel treatments', category: 'identity',
    summary: 'Boards for large data views, crimson ink, gold paint and hazard decoration.',
    keywords: 'panel card header board frame toolbar ink red streak hazard diamond decoration gold paint',
    markup: `<section class="b5-panel b5-panel--board" aria-label="Board example"><header class="b5-panel__header"><span class="b5-board__label"><span class="b5-dot"></span>Progress map</span><div class="b5-board__tools"><div class="b5-filter-group b5-filter-group--paint" role="group" aria-label="Map mode"><button class="b5-filter" type="button" aria-pressed="true">Units</button><button class="b5-filter" type="button" aria-pressed="false">Functions</button></div></div></header><div class="b5-panel__body"><p class="b5-muted">A large data view, with its own controls in the header.</p></div></section>
<article class="b5-panel b5-panel--ink b5-panel--hazard"><header class="b5-panel__header"><h3 class="b5-section-title">Blocked work</h3><span class="b5-ribbon b5-ribbon--gold">4 units</span></header><div class="b5-panel__body"><p class="b5-muted">Reusable headers, painted dividers and contextual decals.</p></div><footer class="b5-panel__footer">A shared surface for every dashboard.</footer></article>`
  },
  {
    id: 'status-labels', title: 'Badges & indicators', category: 'feedback',
    summary: 'Framed badges, slanted labels and quiet live markers.',
    keywords: 'badge pill label live online offline connecting status roles tone success warning danger info',
    markup: `<div class="b5-stack"><div class="b5-row"><span class="b5-badge" data-tone="success">Online</span><span class="b5-badge" data-tone="warning">Connecting</span><span class="b5-badge" data-tone="danger">Offline</span></div><div class="b5-ribbons">${ribbon('In progress', 'info')}${ribbon('Reviewed', 'success')}<span class="b5-ribbon b5-ribbon--gold">Administrator</span></div><div class="b5-row"><span class="b5-status" data-tone="success">Server online</span><span class="b5-status" data-tone="danger">Connection lost</span></div></div>`
  },
  {
    id: 'menu-rows', title: 'Menu cursor rows', category: 'data', flush: true,
    summary: 'One shared selection sweep for queues, dependencies and work lists.',
    keywords: 'queue list row selection chevron paint hover dependency goals blocked work',
    markup: `<ul class="b5-menu-list"><li><button class="b5-menu-item" type="button" data-b5-dialog-open="catalog-detail-drawer"><span class="b5-menu-item__title b5-mono">BrnCamera.cpp</span><span class="b5-menu-item__meta">87 functions · ready to inspect</span><span class="b5-menu-item__trailing b5-ribbon" data-tone="success">Done</span></button></li><li><button class="b5-menu-item" type="button" data-b5-dialog-open="catalog-detail-drawer"><span class="b5-menu-item__title b5-mono">BrnWorld.cpp</span><span class="b5-menu-item__meta">195 functions · example dependency</span><span class="b5-menu-item__trailing b5-ribbon" data-tone="warning">Queued</span></button></li></ul>`
  },
  {
    id: 'data-tables', title: 'Dense data tables', category: 'data', wide: true, flush: true,
    summary: 'Scrollable native tables with the menu selection treatment. Application examples include working sorting and filtering.',
    keywords: 'table translation units functions explorer row hover sorting inspect',
    markup: `<div class="b5-table-wrap" tabindex="0" role="region" aria-label="Sample unit table"><table class="b5-table b5-table--menu"><caption class="b5-sr-only">Example translation units</caption><thead><tr><th scope="col">Translation unit</th><th scope="col">Status</th><th scope="col">Functions</th><th scope="col">Action</th></tr></thead><tbody><tr><td class="b5-mono">BrnCamera.cpp</td><td>${ribbon('Done', 'success')}</td><td>87</td><td><button class="b5-button b5-button--ghost" type="button" data-b5-dialog-open="catalog-detail-drawer">Inspect ↗</button></td></tr><tr><td class="b5-mono">BrnWorld.cpp</td><td>${ribbon('Queued', 'warning')}</td><td>195</td><td><button class="b5-button b5-button--ghost" type="button" data-b5-dialog-open="catalog-detail-drawer">Inspect ↗</button></td></tr></tbody></table></div>`
  },
  {
    id: 'timelines', title: 'Events & commit timelines', category: 'data',
    summary: 'A common rhythm for work events and repository updates.',
    keywords: 'events commits timeline activity history time',
    markup: `<ol class="b5-timeline"><li><time datetime="2026-10-22T18:32:00+02:00">18:32 · Example event</time><strong>Camera unit completed</strong><p>87 functions verified in the sample dataset.</p></li><li><time datetime="2026-10-22T18:24:00+02:00">18:24 · Example event</time><strong>World streaming queued</strong><p>Dependency ready for the next contributor.</p></li><li><time datetime="2026-10-22T18:10:00+02:00">18:10 · Example build</time><strong>New sample build available</strong><p>One shared release presentation across tools.</p></li></ol>`
  },
  {
    id: 'people', title: 'Players & contributors', category: 'patterns',
    summary: 'Avatar colors, role labels, roster rows and compact memberships.',
    keywords: 'player contributor agent avatar host persona member profile row',
    markup: `${person('D1', 'Driver 01', 'Hosting a Freeburn lobby', '', 'HOST')}${person('C2', 'Example contributor', 'Working on BrnWorld.cpp', 'gold', 'ACTIVE')}`
  },
  {
    id: 'metadata', title: 'Metadata & detail sections', category: 'data',
    summary: 'Consistent sections and wrapping for technical values.',
    keywords: 'metadata key value definition list detail source address owner dependency',
    markup: `<section class="b5-detail-section" aria-labelledby="catalog-metadata-title"><h3 id="catalog-metadata-title">Translation unit</h3><dl class="b5-kv"><div><dt>Source</dt><dd class="b5-mono">GameSource/Example/BrnCamera.cpp</dd></div><div><dt>Functions</dt><dd>87</dd></div><div><dt>Owner</dt><dd>Example contributor</dd></div><div><dt>Availability</dt><dd>${ribbon('In build', 'success')}</dd></div></dl></section>`
  },
  {
    id: 'linear-progress', title: 'Linear progress', category: 'data',
    summary: 'Native progress elements with a shared palette.',
    keywords: 'progress bars percentage coverage native accessibility label meter',
    markup: `<div class="b5-stack"><label class="b5-field"><span class="b5-label">Reconstruction coverage · 63.7%</span><progress class="b5-progress" max="100" value="63.7">63.7%</progress></label><label class="b5-field"><span class="b5-label">Runtime coverage · 41.2%</span><progress class="b5-progress b5-progress--gold" max="100" value="41.2">41.2%</progress></label></div>`
  },
  {
    id: 'activity-charts', title: 'Activity & contribution bars', category: 'data',
    summary: 'Small activity histograms and labeled comparison rows.',
    keywords: 'sparkline histogram activity chart contribution bars profile',
    markup: `<div id="catalog-sparkline" class="b5-sparkline" role="img" aria-label="Example activity"></div><div class="b5-bar-row"><div class="b5-bar-row__label"><span>Primary contribution</span><span>72%</span></div><progress class="b5-progress" aria-label="Primary contribution" max="100" value="72">72%</progress></div><div class="b5-bar-row"><div class="b5-bar-row__label"><span>Reviewed functions</span><span>48%</span></div><progress class="b5-progress b5-progress--gold" aria-label="Reviewed functions" max="100" value="48">48%</progress></div>`,
    api: 'renderSparkline(element, [2, 5, 3, 8, 4, 9, 7], { label: "Contributions by day" });'
  },
  {
    id: 'drawers', title: 'Themed detail drawers', category: 'patterns',
    summary: 'Ink headers, back controls, game close prompts and reusable sections.',
    keywords: 'detail drawer back history close game button findings profile function goal',
    markup: `<button class="b5-button b5-button--ink" type="button" data-b5-dialog-open="catalog-detail-drawer">Inspect translation unit ↗</button>`,
    sourceIds: ['catalog-detail-drawer'], api: 'openDialog(dialog, { trigger });'
  },
  {
    id: 'dialogs', title: 'Modal dialogs', category: 'feedback',
    summary: 'Native modal behavior, explicit keyboard wrapping and focus return.',
    keywords: 'dialog modal focused settings confirmation cancel keyboard escape focus',
    markup: `<button class="b5-button" type="button" data-b5-dialog-open="catalog-modal">Open session settings ↗</button>`,
    sourceIds: ['catalog-modal']
  },
  {
    id: 'notifications', title: 'Feedback tones', category: 'feedback',
    summary: 'Plain text, a visible dismiss action and readable severity colors.',
    keywords: 'toast notifications success warning error danger persistent dismiss alert feedback',
    markup: `<div class="b5-row"><button class="b5-button" type="button" data-demo-toast="success">Success</button><button class="b5-button" type="button" data-demo-toast="info">Information</button><button class="b5-button" type="button" data-demo-toast="warning">Warning</button><button class="b5-button" type="button" data-demo-toast="danger">Error</button></div>`,
    api: 'notify("Directory refreshed.", { tone: "success" });'
  },
  {
    id: 'ticker', title: 'News ticker', category: 'feedback', wide: true,
    summary: 'The newest events crawl past in amber LED type, like the game\'s news ticker; hover or the pause toggle stops them.',
    keywords: 'ticker crawl news radio crash fm led dot matrix pixel amber events live feed marquee pause reduced motion',
    markup: `<section class="b5-ticker" aria-label="Latest events (example)">
  <div class="b5-ticker__window"><ul class="b5-ticker__track"><li class="b5-ticker__item"><strong>Merged</strong> Driver 01 · BrnCamera.cpp · 2 min ago</li><li class="b5-ticker__item"><strong>Claimed</strong> Driver 02 · BrnWorld.cpp · 9 min ago</li><li class="b5-ticker__item"><strong>Compiled</strong> Driver 03 · BrnTraffic.cpp · 1 h ago</li><li class="b5-ticker__item"><strong>Blocked</strong> Driver 04 · BrnAudio.cpp · 3 h ago</li><li class="b5-ticker__item" aria-hidden="true"><strong>Merged</strong> Driver 01 · BrnCamera.cpp · 2 min ago</li><li class="b5-ticker__item" aria-hidden="true"><strong>Claimed</strong> Driver 02 · BrnWorld.cpp · 9 min ago</li><li class="b5-ticker__item" aria-hidden="true"><strong>Compiled</strong> Driver 03 · BrnTraffic.cpp · 1 h ago</li><li class="b5-ticker__item" aria-hidden="true"><strong>Blocked</strong> Driver 04 · BrnAudio.cpp · 3 h ago</li></ul></div>
  <button class="b5-ticker__toggle" type="button" aria-pressed="false"><span class="b5-sr-only">Pause</span></button>
</section>`,
    api: 'enhance(root); // or createTicker(tickerElement).pause()'
  },
  {
    id: 'copy-actions', title: 'Copy actions', category: 'controls',
    summary: 'One reusable action for addresses, configuration and snippets.',
    keywords: 'copy address clipboard button text code snippet fallback',
    markup: `<div class="b5-stack"><code id="catalog-copy-text" class="b5-code">example.invalid:27900</code><button class="b5-button b5-button--ghost" type="button" data-b5-copy="catalog-copy-text">${icon('copy')} Copy example address</button></div>`
  },
  {
    id: 'forms', title: 'Fields & validation', category: 'controls',
    summary: 'Text fields, native options, checks, radios and explicit error text.',
    keywords: 'forms inputs textarea checkbox radio label hint invalid validation disabled required native select',
    markup: `<div class="b5-stack"><label class="b5-field"><span class="b5-label">Display name</span><input class="b5-input" type="text" placeholder="Your name in Paradise" maxlength="32"><span class="b5-hint">Up to 32 characters.</span></label><label class="b5-field"><span class="b5-label">Example invalid server</span><input class="b5-input" type="text" aria-invalid="true" aria-describedby="catalog-field-error"><span id="catalog-field-error" class="b5-field-error">Enter a server address.</span></label><label class="b5-field"><span class="b5-label">Session note</span><textarea class="b5-textarea" rows="2" placeholder="Meet at the next junction."></textarea></label><div class="b5-row"><label class="b5-check"><input type="checkbox" checked> Public session</label><label class="b5-check"><input type="radio" name="catalog-mode" checked> Freeburn</label><label class="b5-check"><input type="radio" name="catalog-mode"> Challenge</label></div></div>`
  },
  {
    id: 'configuration', title: 'Configuration panels', category: 'patterns',
    summary: 'Copyable configuration, syntax colors, a supporting note and a footer stamp.',
    keywords: 'config ini code panel copy syntax note stamp server key',
    markup: `<section class="b5-config" aria-label="Example configuration"><div class="b5-config__header"><span><span class="b5-dot"></span> config.ini</span><button class="b5-config__action" type="button" data-b5-copy="catalog-config">Copy configuration <span aria-hidden="true">⧉</span></button></div><pre class="b5-code"><code id="catalog-config"><span class="b5-code__comment">; Example connection details</span>
<span class="b5-code__section">[Online]</span>
Server=<span class="b5-code__value">example.invalid:27900</span>
Key=<span class="b5-code__value">YOUR_SERVER_KEY</span></code></pre><div class="b5-config__note"><span aria-hidden="true">↗</span><p>Use the same server and key as your friends. This is an example configuration.</p></div><div class="b5-config__stamp">See you at the next junction.</div></section>`
  },
  {
    id: 'steps', title: 'Numbered steps', category: 'patterns',
    summary: 'Reusable connection, setup and release instructions.',
    keywords: 'steps ordered instructions onboarding get connected launch setup',
    markup: `<ol class="b5-steps"><li><div><strong>Get the current build</strong><p>Choose a compatible build for your project.</p></div></li><li><div><strong>Set your connection details</strong><p>Configure your community server.</p></div></li><li><div><strong>Launch. Find friends. Freeburn.</strong><p>Start the game and use Easy Drive.</p></div></li></ol>`
  },
  {
    id: 'statistics', title: 'Statistics strips', category: 'data', wide: true,
    summary: 'Shared rules, condensed values and flexible supporting labels.',
    keywords: 'statistics stats strip players lobbies capacity uptime values metrics',
    markup: `<div class="b5-stat-strip"><div class="b5-stat"><div class="b5-stat__label">Players online</div><div class="b5-stat__value"><strong>12</strong><span class="b5-stat__context">of 128 server slots</span></div></div><div class="b5-stat"><div class="b5-stat__label">Active lobbies</div><div class="b5-stat__value"><strong>03</strong><span class="b5-stat__context">across Paradise City</span></div></div><div class="b5-stat"><div class="b5-stat__label">Lobby capacity</div><div class="b5-stat__value"><strong>08</strong><span class="b5-stat__context">players per lobby</span></div></div><div class="b5-stat"><div class="b5-stat__label">Server uptime</div><div class="b5-stat__value"><strong>2d 4h</strong><span class="b5-stat__context">and counting</span></div></div></div>`
  },
  {
    id: 'trees', title: 'Expandable trees', category: 'data',
    summary: 'Native disclosures with the shared menu hover treatment.',
    keywords: 'tree files directories archive build preview expandable details summary',
    markup: `<div class="b5-tree b5-tree--menu"><details open><summary>sample-build</summary><ul><li><details><summary>ui</summary><ul><li>b5-ui.css</li><li>b5-ui.js</li><li>select.js</li><li>pager.js</li><li>download.js</li></ul></details></li><li><details><summary>assets</summary><ul><li>paradise-city.webp</li><li>banner-red.png</li></ul></details></li><li>README.md</li></ul></details></div>`
  },
  {
    id: 'loading-states', title: 'Loading, stale & error', category: 'feedback',
    summary: 'Explicit states while waiting, retaining a snapshot, or recovering.',
    keywords: 'loading skeleton stale error retry offline busy alert warning',
    markup: `<div class="b5-stack"><div class="b5-loading" role="status" aria-label="Loading example data"><span class="b5-skeleton b5-skeleton--title" aria-hidden="true"></span><span class="b5-skeleton" aria-hidden="true"></span><span class="b5-skeleton b5-skeleton--short" aria-hidden="true"></span><span class="b5-hint">Loading example data…</span></div><div class="b5-alert" data-tone="warning"><div><strong>Showing the last snapshot</strong><p>The directory could not be refreshed. Your last data stays visible.</p></div></div><div class="b5-alert" data-tone="danger"><div><strong>Connection unavailable</strong><p>Retry when your connection is ready.</p><button class="b5-link" type="button" data-demo-toast="info">Retry example ↗</button></div></div></div>`
  },
  {
    id: 'pagination', title: 'Pagination controls', category: 'controls', wide: true,
    summary: 'Page numbers, ellipses, range feedback and direct page entry.',
    keywords: 'pager pagination previous next jump pages ranges ellipsis results',
    markup: `<nav class="b5-pagination" data-b5-pager data-b5-total="4319" data-b5-page-size="50" aria-label="Example result pages"></nav>`,
    api: 'pager.addEventListener("b5:pagechange", ({ detail }) => loadPage(detail.page));'
  },
  {
    id: 'tooltips', title: 'Icons & tooltips', category: 'controls',
    summary: 'Shared SVG symbols, visible focus and dismissible keyboard hints.',
    keywords: 'tooltip hint icon eye preview copy download search vector close keyboard escape',
    markup: `<div class="b5-row"><span class="b5-tooltip"><button class="b5-icon-button" type="button" data-b5-dialog-open="catalog-build-dialog" aria-label="Inspect sample build" aria-describedby="catalog-inspect-tooltip">${icon('eye')}</button><span role="tooltip" id="catalog-inspect-tooltip">Inspect the sample build</span></span>${icon('search')}${icon('refresh')}${icon('copy')}${icon('download')}${icon('folder')}${icon('file')}</div>`
  },
  {
    id: 'footers', title: 'Footers & project links', category: 'identity',
    summary: 'A shared finish for the public site and its supporting tools.',
    keywords: 'footer version branding project links community legal attribution',
    markup: `<footer class="b5-site-footer"><a class="b5-site-footer__brand" href="./examples.html">PARADISE ONLINE <span>/</span> BUILT FOR THE COMMUNITY</a><div class="b5-site-footer__meta"><span>v0.2.0</span><span>·</span><a href="../THIRD_PARTY.md">Attribution ↗</a></div></footer>`
  },
  {
    id: 'artwork', title: 'Shared artwork & decals', category: 'identity', wide: true,
    summary: 'The extracted UI artwork, with source hashes and separate attribution. Select a tile to copy its asset path.',
    keywords: 'assets textures grunge skyline tire track splatter scribble chevron logo seal brush paint art pack',
    markup: `<div class="catalog-assets" id="catalog-artwork"></div>`,
    api: '<img src="./ui/assets/paradise-city.webp" alt="Paradise City">'
  }
];

export { person };
