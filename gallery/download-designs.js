// Every download design, for the gallery's Design switch and the side-by-side page
// (download-designs.html). markup(prefix, dialogId) builds one design: the prefix names its
// button (the prefix itself), its group and its chooser (`${prefix}-menu`); dialogId, when
// given, is the dialog its preview opens. Each design opens its own chooser in place, in its
// own idiom (download-chooser.js runs them, download-choosers.css dresses them);
// download-designs.css dresses the explorations at rest. The bars and the guide sign build
// on library components.
const icon = name => `<svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#${name}"></use></svg>`;
const opens = dialog => (dialog ? ` data-b5-dialog-open="${dialog}"` : '');
const trigger = (p, label) => `id="${p}" type="button" aria-expanded="false" aria-controls="${p}-menu" data-dd-trigger${label ? ` aria-label="${label}"` : ''}`;
const panel = (p, className, inner) => `<div class="dd-chooser ${className}" id="${p}-menu" role="region" aria-labelledby="${p}-menu-title" data-dd-panel inert>${inner}</div>`;
const heading = (p, className = 'b5-sr-only', text = 'Choose your download') => `<span class="${className}" id="${p}-menu-title">${text}</span>`;
const note = className => `<p class="dd-note ${className}"><span class="b5-status" data-tone="success">Assets unchanged</span> <span>Already have the game folder? <strong>Update only</strong> is all you need.</span></p>`;
const choice = (item, className, inner) => `<a class="dd-choice dd-choice--${item.key} ${className}" href="${item.href}" download="${item.file}">${inner}</a>`;
const spoken = item => `<span class="b5-sr-only">, ${item.blurb}</span>`;
const turnBack = (className, what) => `<button class="dd-turn ${className}" type="button" data-dd-close aria-label="Turn the ${what} back">${icon('refresh')}</button>`;

/** The two packages every chooser offers; the sample files stand in for the builds. */
export const choices = [
  { key: 'full', title: 'Full game', size: '4.69 GB', figure: '4.69', unit: 'GB', icon: 'folder', short: 'First install', blurb: 'Game files, DLLs and assets. For your first install or when the assets change.', href: '../docs/integration.md', file: 'sample-full-game-guide.md' },
  { key: 'update', title: 'Update only', size: '8.2 MB', figure: '8.2', unit: 'MB', icon: 'refresh', short: 'Over your game folder', blurb: 'Executable, DLLs and .cgsmap. Extract over your existing game folder.', href: '../CHANGELOG.md', file: 'sample-update-notes.md' }
];

// ---- bars: a panel slides out from under the bar ------------------------------------------
const tooltipEye = (p, dialog) => `<span class="b5-tooltip"><button class="b5-download-preview" type="button"${opens(dialog)} aria-label="Preview sample contents" aria-describedby="${p}-tooltip">${icon('eye')}</button><span id="${p}-tooltip" role="tooltip">Preview the sample contents</span></span>`;
const plate = '<span class="b5-plate" aria-hidden="true"><span class="b5-plate__state">Paradise City</span><span class="b5-plate__number">3ADD8AD</span></span>';
// the tachometer's chooser: each package a gear with its shift lights; the needle follows
const shift = p => panel(p, 'dd-shift', `${heading(p, 'dd-shift__title')}${choices.map(item => choice(item, 'dd-shift__gear',
  `<span class="dd-shift__lights" aria-hidden="true">${'<i></i>'.repeat(10)}</span><span class="dd-shift__name">${item.title}</span><span class="dd-shift__size">${item.size}</span><span class="dd-shift__blurb">${item.blurb}</span>`)).join('')}${note('dd-shift__note')}`);
// the dashboard's: a trip computer whose drums roll to each package's size
const drums = figure => [...figure].map(digit => digit === '.' ? '<span class="dd-drum-dot">.</span>' : `<span class="dd-drum dd-d${digit}"><span>${[...'0123456789'].map(d => `<i>${d}</i>`).join('')}</span></span>`).join('');
const trip = p => panel(p, 'dd-trip', `${heading(p, 'dd-trip__title')}${choices.map((item, index) => choice(item, 'dd-trip__row',
  `<span class="dd-trip__tag" aria-hidden="true">Trip ${'AB'[index]}</span><span class="dd-trip__name">${item.title}</span><span class="dd-trip__size"><span class="dd-drums" aria-hidden="true">${drums(item.figure)}</span><small aria-hidden="true">${item.unit}</small><span class="b5-sr-only">${item.size}</span></span><span class="dd-trip__blurb">${item.blurb}</span>`)).join('')}${note('dd-trip__note')}`);
// the classic bar's: two strokes of paint
const strokes = p => panel(p, 'dd-strokes', `${heading(p)}${choices.map(item => choice(item, 'dd-stroke',
  `<span class="dd-stroke__icon" aria-hidden="true">${icon(item.icon)}</span><span class="dd-stroke__name">${item.title}</span><span class="dd-stroke__size">${item.size}</span><span class="dd-stroke__blurb">${item.blurb}</span>`)).join('')}${note('dd-stroke__note')}`);

// ---- road signs: the road splits into two lanes, a sign over each ----------------------------
const ARROW = '<svg class="b5-sign__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const SMALL_ARROW = '<svg viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const LANE_ARROW = '<svg class="dd-lane__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const SHIELD = ('<span class="sv-shield" aria-hidden="true"><svg viewBox="0 0 66 72"><path class="sv-shield__edge" d="M33 1C25 5 12 5 3 2 0 22 1 42 10 56c7 9 16 12 23 15 7-3 16-6 23-15 9-14 10-34 7-54-9 3-22 3-30-1Z"/>'
  + '<path class="sv-shield__body" d="M33 5C25 9 14 9 6 7 4 24 5 41 13 53c6 8 13 11 20 14 7-3 14-6 20-14 8-12 9-29 7-46-8 2-19 2-27-2Z"/>'
  + '<path class="sv-shield__top" d="M33 5C25 9 14 9 6 7l-.3 14h54.6L60 7c-8 2-19 2-27-2Z"/></svg><small>PC</small><b>179</b></span>');
const laneHeads = {
  none: () => '',
  tab: index => `<span class="dd-lane__tab" aria-hidden="true">Exit 179${'AB'[index]}</span>`,
  shield: index => `<span class="dd-lane__shield" aria-hidden="true"><small>PC</small><b>179${'AB'[index]}</b></span>`
};
const lanes = (p, head, band) => panel(p, 'dd-lanes', `${heading(p)}<span class="dd-lanes__row">${choices.map((item, index) => choice(item, `dd-lane${band ? ' dd-lane--band' : ''}`,
  `<span class="dd-lane__lamp" aria-hidden="true"></span>${laneHeads[head](index)}<span class="dd-lane__text"><span class="dd-lane__name">${item.title}</span><span class="dd-lane__size">${item.size}</span></span>${band ? `<span class="dd-lane__band" aria-hidden="true">${SMALL_ARROW}<span>${item.short}</span>${SMALL_ARROW}</span>` : LANE_ARROW}${spoken(item)}`)).join('')}</span>${note('dd-lanes__note')}`);
// the message sign changes with the sign's state: the count, the build when pointed at, an
// instruction once open, and the size of the lane being pointed at
const vms = `<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value">128</span><span class="b5-vms__label">DOWNLOADS</span>${[['hover', 'NEW', 'BUILD 179'], ['open', 'PICK', 'A LANE'], ['full', '4.69', 'GB'], ['update', '8.2', 'MB']].map(([state, big, small]) => `<span class="dd-vms dd-vms--${state}"><b>${big}</b><small>${small}</small></span>`).join('')}</span>`;
const LEGEND = '<span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small><span class="b5-sr-only">number 179, 128 downloads, </span>Paradise City · 4.69 GB</small></span>';
const sign = ({ modifier = '', inside, extra = '', head = 'none', band = false }) => (p, dialog) => `<div class="b5-download-group b5-download-group--sign dd-sign${modifier ? ` ${modifier}` : ''}" id="${p}-group" data-dd-chooser>
<div class="b5-sign">
<button class="b5-download" ${trigger(p)}><span class="b5-sign__lamps" aria-hidden="true"></span>${inside}</button>
${lanes(p, head, band)}
${vms}${extra}
<span class="b5-sign__plaque"><button class="b5-download-preview" type="button"${opens(dialog)} aria-label="Preview sample contents">${icon('eye')}</button><span>commit 3add8ad · v0.2.0</span></span>
</div>
</div>`;

// ---- licence plates: the plate revolves to show its back ---------------------------------------
const knob = (className, dialog) => `<button class="knob${className ? ` ${className}` : ''}" type="button"${opens(dialog)} aria-label="Preview sample contents">${icon('eye')}</button>`;
const HOLES = '<i class="lp-hole lp-hole--1"></i><i class="lp-hole lp-hole--2"></i><i class="lp-hole lp-hole--3"></i><i class="lp-hole lp-hole--4"></i>';
const PLATE_TOP = '<span class="lp-top"><span class="lp-month">NOV</span><span class="lp-flag"></span><span class="lp-logo"><span class="lp-seal"></span><span class="lp-script">Paradise City</span></span><span class="lp-flag lp-flag--r"></span><span class="lp-year"><small>PC</small>179</span></span>';
const plateBack = (p, modifier) => panel(p, `lp lp-back${modifier}`, `${HOLES}<span class="lp-top lp-back__top"><span class="lp-month">179</span>${heading(p, 'lp-script lp-back__title')}${turnBack('lp-back__turn', 'plate')}</span>`
  + `<span class="lp-back__choices">${choices.map(item => choice(item, 'lp-back__choice', `<span class="lp-back__name">${item.title}</span><span class="lp-back__size">${item.size}</span><span class="lp-back__short" aria-hidden="true">${item.short}</span>${spoken(item)}`)).join('<span class="lp-back__rib" aria-hidden="true"></span>')}</span>${note('lp-back__note')}`);
const lp = ({ modifier = '', main, url, meta, label }) => (p, dialog) => `<div class="dd">
<div class="lpw" data-dd-chooser>
<div class="dd-revolve">
<button class="lp${modifier}" ${trigger(p, label)}>
${HOLES}
${PLATE_TOP}
${main}
${url}
</button>
${plateBack(p, modifier)}
</div>
<div class="lp-meta">${knob('', dialog)}<span>${meta}</span></div>
</div>
</div>`;
const BOLTS = '<span class="pl-bolt pl-bolt--tl"></span><span class="pl-bolt pl-bolt--tr"></span><span class="pl-bolt pl-bolt--bl"></span><span class="pl-bolt pl-bolt--br"></span>';

// ---- billboards: the board turns over in slats, shatters, or gets a new poster ---------------
const CHEVRONS = '<svg class="bb-chevrons" viewBox="0 0 60 92" aria-hidden="true"><path d="M6 6 30 26 54 6"/><path d="M6 36 30 56 54 36"/><path d="M6 66 30 86 54 66"/></svg>';
const CPLATE = '<span class="cplate__state">Paradise City</span><span class="cplate__number">3ADD8AD</span>';
const RIG = '<span class="bb-catwalk"></span>\n<span class="bb-lamps"><i></i><i></i><i></i></span>\n<span class="bb-legs"><i></i></span>';
const TALLY = '<span class="bb-tally"><b>128</b><small>Smashed</small></span>';
const posterChoices = choices.map(item => choice(item, 'dd-poster__choice', `<span class="dd-poster__name">${item.title}</span><span class="dd-poster__size">${item.size}</span><span class="dd-poster__short" aria-hidden="true">${item.short}</span>${spoken(item)}`)).join('');
const poster = (p, modifier, extra = '') => `<div class="dd-poster ${modifier}">${extra}${heading(p, 'dd-poster__kicker')}<span class="dd-poster__choices">${posterChoices}</span>${note('dd-poster__note')}${turnBack('dd-poster__turn', 'billboard')}</div>`;
const SHARDS = '<svg class="bx-shards" viewBox="0 0 520 210" preserveAspectRatio="none" aria-hidden="true"><path class="cr" d="M84 122 L40 60 L8 30 M84 122 L30 140 L0 150 M84 122 L60 196 M84 122 L150 70 L188 20 M84 122 L170 170 L230 210"/>'
  + '<polygon points="168,26 214,14 196,58"/><polygon points="398,150 462,138 440,196 404,186"/><polygon points="248,170 272,152 286,186"/><polygon points="34,170 58,160 52,192"/><polygon points="450,28 480,20 470,50"/><polygon points="330,8 352,4 344,26"/><polygon points="124,30 140,22 136,44"/></svg>';
const blast = modifier => (p, dialog) => `<div class="dd">
<div class="bx ${modifier}" data-dd-chooser data-dd-effect="shatter">
<button class="bx-board" ${trigger(p, 'Download build number 179, Paradise City, 4.69 GB')}>
<span class="bx-face" data-dd-face>
<span class="bx-art"></span>
<span class="bx-sparks"></span>
<span class="bx-word" data-text="Download">Download</span>
${SHARDS}
<span class="bx-planks"></span>
<span class="bx-flyer"><b>Build No. 179</b><small>Paradise City · 4.69 GB ▾</small></span>
<span class="cplate bx-plate">${CPLATE}</span>
</span>
</button>
${panel(p, 'dd-board-panel', poster(p, 'dd-poster--blast', '<span class="bx-art"></span><span class="bx-sparks"></span><span class="bx-planks"></span>'))}
<span class="bx-base"><i></i><i></i><i></i><i></i></span>
${knob('bx-eye', dialog)}
<span class="bx-meta">commit 3add8ad · 3h ago</span>
${TALLY}
</div>
</div>`;

export const downloadDesigns = [
  { id: 'cluster', group: 'Bar', code: 'X1', label: 'Tachometer cluster', note: 'current', skins: true,
    markup: (p, dialog) => `<div class="dd-bar dd-bar--cluster" data-dd-chooser data-dd-room>
<div class="b5-download-group b5-download-group--cluster" id="${p}-group">
  <button class="b5-download" ${trigger(p)} data-skin="tireburn">
    <span class="b5-download__boost" aria-hidden="true"></span>
    <span class="b5-gauge" data-b5-gauge aria-hidden="true"><span class="b5-gauge__badge">No. 179</span><span data-b5-odometer="128"></span><span class="b5-gauge__unit">Downloads</span></span>
    ${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta">${plate}<small><span class="b5-sr-only">number 179, commit 3add8ad, 128 downloads, </span>v0.2.0 · PC</small></span></span>
  </button>
  ${shift(p)}
  ${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'dashboard', group: 'Bar', code: 'X2', label: 'Dashboard bar', note: 'plate, odometer, boost', skins: true,
    markup: (p, dialog) => `<div class="dd-bar dd-bar--dash" data-dd-chooser data-dd-room>
<div class="b5-download-group" id="${p}-group">
<button class="b5-download" ${trigger(p)} data-skin="tireburn">
<span class="b5-download__boost" aria-hidden="true"></span>${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta">${plate}<small><span class="b5-sr-only">number 179, commit 3add8ad, 128 downloads, </span>No. 179 · v0.2.0 · PC</small></span></span>
</button>
${trip(p)}
<span class="b5-download-counter"><span data-b5-odometer="128"></span><span class="b5-sr-only">128</span><small>Downloads</small></span>
${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'classic', group: 'Bar', code: 'X3', label: 'Classic bar', note: 'the first one', skins: true,
    markup: (p, dialog) => `<div class="dd-bar dd-bar--classic" data-dd-chooser data-dd-room>
<div class="b5-download-group" id="${p}-group">
<button class="b5-download" ${trigger(p)} data-skin="tireburn">
${icon('download')}<span><strong>Download build</strong><small>v0.2.0 · PC</small></span>
</button>
${strokes(p)}
<span class="b5-download-counter"><strong>128</strong><small>Downloads</small></span>
${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'sign', group: 'Road sign', code: 'B1', label: 'Guide sign', note: 'library', skins: false,
    markup: sign({ head: 'tab', inside: `<span class="b5-sign__tab" aria-hidden="true">Exit 179</span>${LEGEND}${ARROW}` }) },
  { id: 'sign-game', group: 'Road sign', code: 'B2', label: 'Paradise sign', note: 'game style', skins: false,
    markup: sign({ modifier: 'sv-game', inside: `<span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build number 179, 128 downloads, Paradise City, 4.69 GB</span></strong></span>${ARROW}`, extra: '<span class="sv-supp" aria-hidden="true">Build 179 · 4.69 GB <i>▾</i></span>' }) },
  { id: 'sign-exit', group: 'Road sign', code: 'B3', label: 'Exit only', note: 'yellow panel', skins: false,
    markup: sign({ modifier: 'sv-only', band: true, inside: `${LEGEND}<span class="sv-only-band" aria-hidden="true">${SMALL_ARROW}<span>Build 179</span>${SMALL_ARROW}</span>` }) },
  { id: 'sign-route', group: 'Road sign', code: 'B4', label: 'Route shield', note: 'interstate', skins: false,
    markup: sign({ modifier: 'sv-route', head: 'shield', inside: `${SHIELD}${LEGEND}${ARROW}` }) },
  { id: 'plate-sunset', group: 'Licence plate', code: 'A1', label: 'Sunset plate', note: 'first plate', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="pl" data-dd-chooser>
<div class="dd-revolve">
<button class="pl-plate" ${trigger(p, 'Download build number 179, 128 downloads')}>
${BOLTS}
<span class="pl-state">Paradise City</span>
<span class="pl-number">3ADD8AD</span>
<span class="pl-slogan">↓ Download build ▾</span>
<span class="pl-odo"><span class="odo"><i>1</i><i>2</i><i>8</i></span><small>Downloads</small></span>
<span class="pl-sticker"><b>179</b><small>Build</small></span>
</button>
${panel(p, 'pl-plate pl-back', `${BOLTS}${heading(p, 'pl-state pl-back__title')}<span class="pl-back__choices">${choices.map(item => choice(item, 'pl-back__choice', `<span class="pl-back__name">${item.title}</span><span class="pl-back__size">${item.size}</span>${spoken(item)}`)).join('<span class="pl-back__rib" aria-hidden="true"></span>')}</span><span class="pl-back__foot">${note('pl-back__note')}${turnBack('pl-back__turn', 'plate')}</span>`)}
</div>
${knob('pl-eye', dialog)}
</div>
</div>` },
  { id: 'plate-paradise', group: 'Licence plate', code: 'A2', label: 'Paradise plate', note: 'closest to the game', skins: false,
    markup: lp({ main: '<span class="lp-main">Download</span>', url: '<span class="lp-url">DECOMP.ADRIWIN.FR <i>▾</i></span>', meta: '<b>128</b> downloads · 4.69 GB · commit 3add8ad · 3h ago', label: 'Download build number 179, 128 downloads' }) },
  { id: 'plate-registration', group: 'Licence plate', code: 'A3', label: 'Registration', note: 'commit embossed', skins: false,
    markup: lp({ main: '<span class="lp-main lp-main--reg">3ADD8AD</span>', url: '<span class="lp-url lp-url--cta">▼ Download the build ▾</span>', meta: '<b>128</b> downloads · 4.69 GB · 3h ago', label: 'Download the build, commit 3add8ad, 128 downloads' }) },
  { id: 'plate-night', group: 'Licence plate', code: 'A4', label: 'Night plate', note: 'site colours', skins: false,
    markup: lp({ modifier: ' lp--night', main: '<span class="lp-main">Download</span>', url: '<span class="lp-url">DECOMP.ADRIWIN.FR <i>▾</i></span>', meta: '<b>128</b> downloads · 4.69 GB · commit 3add8ad · 3h ago', label: 'Download build number 179, 128 downloads' }) },
  { id: 'billboard', group: 'Billboard', code: 'C1', label: 'Billboard', note: 'steel rig', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bb" data-dd-chooser data-dd-effect="slats">
<div class="bb-rig">
<button class="bb-board" ${trigger(p, 'Download build number 179, Paradise City, 4.69 GB')}>
<span class="bb-poster"></span>
<span class="bb-wash"></span>
<span class="bb-kicker">New build · No. 179</span>
<strong class="bb-title">Download</strong>
<span class="bb-sub">Paradise City · 4.69 GB <i>▾</i></span>
${CHEVRONS}
<span class="cplate bb-plate">${CPLATE}</span>
<svg class="bb-cracks" viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true"><path d="M262 78 L300 30 L322 8 M262 78 L330 70 L392 82 M262 78 L298 120 L318 166 M262 78 L222 128 L200 168 M262 78 L214 54 L170 18 M300 30 L284 4 M330 70 L352 46 M298 120 L338 138"/></svg>
</button>
${panel(p, 'dd-board-panel', poster(p, 'dd-poster--trivision'))}
${RIG}
</div>
${knob('bb-eye', dialog)}
<span class="bb-meta">commit 3add8ad · 3h ago</span>
${TALLY}
</div>
</div>` },
  { id: 'billboard-fire', group: 'Billboard', code: 'C2', label: 'Blast', note: 'fire', skins: false, markup: blast('bx--fire') },
  { id: 'billboard-paint', group: 'Billboard', code: 'C3', label: 'Blast', note: 'site colours', skins: false, markup: blast('bx--paint') },
  { id: 'billboard-pasted', group: 'Billboard', code: 'C4', label: 'Pasted over', note: 'build 179 over 178', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bb bp" data-dd-chooser>
<div class="bb-rig">
<button class="bb-board" ${trigger(p, 'Download build number 179, Paradise City, 4.69 GB')}>
<span class="bp-old"><span class="bp-old__kicker">Build No. 178</span><span class="bp-old__title">No. 178</span></span>
<span class="bp-new">
<span class="bp-kicker">New build · No. 179</span>
<strong class="bp-title">Download</strong>
<span class="bp-sub">Paradise City · 4.69 GB <i>▾</i></span>
${CHEVRONS.replace('class="bb-chevrons"', 'class="bb-chevrons bp-chevrons"')}
<span class="cplate bp-plate">${CPLATE}</span>
</span>
<svg class="bp-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="57,0 58.5,4 60,1.5 62.5,6 64,3 66.5,9.5 69,6.5 70.5,12 73.5,10 75,16.5 77.5,14 80,22 82,19 84,27.5 86.5,25.5 88,31 91,29.5 92.5,37 95.5,34.5 97.5,41 100,40" vector-effect="non-scaling-stroke"/><polyline class="bits" points="66.5,9.5 67.5,13" vector-effect="non-scaling-stroke"/></svg>
</button>
${panel(p, 'dd-board-panel dd-paste', `${poster(p, 'dd-poster--paste')}<span class="dd-paste__roller" aria-hidden="true"></span>`)}
${RIG}
</div>
${knob('bb-eye', dialog)}
<span class="bb-meta">commit 3add8ad · 3h ago</span>
${TALLY}
</div>
</div>` }
];
