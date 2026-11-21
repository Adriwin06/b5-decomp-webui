/**
 * Download designs: fifteen ways to draw the download control (bars, road signs, licence
 * plates, billboards), each opening its packages in place, in its own idiom, instead of the
 * floating .b5-download-menu. Optional: load download-designs.css after b5-ui.css and import
 * this module; the core library does not need either.
 *
 *   const download = renderDownloadDesign(slot, 'sign-game', { data, onChoose, onPreview });
 *   download.update(nextData);          // a new build redraws; a new count or age updates in place
 *   download.setNote({ tone: 'warning', label: 'Daily limit reached', text: '…' });
 *
 * Swapping designs is a change of name: every design reads the same data.
 */
import { renderGauge, setOdometer } from './index.js';

// ---- the chooser: a disclosure the design opens in place --------------------------------
//
// Markup: [data-dd-chooser] holds a [data-dd-trigger] button whose aria-controls names a
// [data-dd-panel] inside it. Optional: data-dd-room (the panel hangs below the design, which
// reserves its height in --dd-room); data-dd-effect="slats" | "shatter" (a decorative layer of
// copies of the design's face turns over in slats or breaks into shards between the closed and
// open states); [data-dd-close] buttons in the panel. The root carries data-open while open and
// data-phase (opening, open, closing, closed); CSS sets --dd-open-ms and --dd-close-ms for
// designs whose phases take time.
const choosers = new WeakMap();
const SHARD_CENTRE = [22, 58];
// the rim of the face, clockwise from the top-left corner: each shard is a wedge from the impact
const SHARD_RIM = [[0, 0], [16, 0], [38, 0], [62, 0], [84, 0], [100, 0], [100, 26], [100, 54], [100, 80], [100, 100], [78, 100], [52, 100], [30, 100], [8, 100], [0, 100], [0, 74], [0, 40]];

function copyOf(source, className) {
  const art = source.ownerDocument.createElement('span');
  art.className = className;
  if (source.matches('button')) for (const child of source.children) art.append(child.cloneNode(true));
  else art.append(source.cloneNode(true));
  art.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  return art;
}

function buildEffect(root, trigger, panel) {
  const kind = root.dataset.ddEffect;
  if (!kind) return null;
  const doc = root.ownerDocument;
  const layer = doc.createElement('span');
  layer.className = `dd-fx dd-fx--${kind}`;
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  if (kind === 'slats') {
    const count = 8;
    for (let index = 0; index < count; index++) {
      const slat = doc.createElement('span');
      slat.className = 'dd-fx__piece';
      slat.style.setProperty('--i', index);
      slat.style.setProperty('--n', count);
      for (const [side, source] of [['front', trigger], ['back', panel.firstElementChild]]) {
        const face = doc.createElement('span');
        face.className = `dd-fx__face dd-fx__face--${side}`;
        face.append(copyOf(source, `dd-fx__art dd-fx__art--${side}`));
        slat.append(face);
      }
      layer.append(slat);
    }
  } else if (kind === 'shatter') {
    const face = trigger.querySelector('[data-dd-face]') ?? trigger;
    const [cx, cy] = SHARD_CENTRE;
    SHARD_RIM.forEach(([x1, y1], index) => {
      const [x2, y2] = SHARD_RIM[(index + 1) % SHARD_RIM.length];
      const shard = doc.createElement('span');
      shard.className = 'dd-fx__piece';
      shard.style.clipPath = `polygon(${cx}% ${cy}%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
      // each shard flies out from the impact, spins and falls; far shards go further
      const mx = (cx + x1 + x2) / 3 - cx, my = (cy + y1 + y2) / 3 - cy;
      const reach = Math.hypot(mx, my) || 1;
      const push = 1.6 + (index % 3) * .35;
      shard.style.setProperty('--dx', `${(mx / reach) * 46 * push + mx * 1.4}%`);
      shard.style.setProperty('--dy', `${(my / reach) * 30 * push + 70 + (index % 4) * 14}%`);
      shard.style.setProperty('--r', `${(index % 2 ? 1 : -1) * (18 + (index * 23) % 50)}deg`);
      shard.style.setProperty('--d', `${(index * 37) % 120}ms`);
      shard.append(copyOf(face, 'dd-fx__art'));
      layer.append(shard);
    });
  }
  trigger.after(layer);
  return layer;
}

/** Make one design's chooser work; returns its controller (the same one on a second call). */
export function createDownloadChooser(root) {
  if (choosers.has(root)) return choosers.get(root);
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const trigger = root.querySelector('[data-dd-trigger]');
  const panel = trigger && doc.getElementById(trigger.getAttribute('aria-controls'));
  if (!panel || !root.contains(panel)) throw new TypeError('A chooser needs a trigger that controls a panel inside it');
  const layer = buildEffect(root, trigger, panel);
  let opened = false;
  let timer = 0;
  let pendingFocus = null;
  const choices = () => [...panel.querySelectorAll('a[href]')];
  const time = name => {
    const value = parseFloat(win.getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  };

  function measure() {
    if (!root.hasAttribute('data-dd-room')) return;
    const parent = panel.offsetParent;
    const room = opened && parent ? Math.max(0, panel.offsetTop + panel.offsetHeight - parent.offsetHeight) : 0;
    root.style.setProperty('--dd-room', `${Math.ceil(room)}px`);
  }
  function focusChoice(which) {
    pendingFocus = null;
    const list = choices();
    (which === 'last' ? list.at(-1) : list[0])?.focus({ preventScroll: true });
  }
  function settle(phase, after) {
    win.clearTimeout(timer);
    root.dataset.phase = phase;
    const wait = time(phase === 'opening' ? '--dd-open-ms' : '--dd-close-ms');
    const finish = () => { root.dataset.phase = after; if (after === 'open' && pendingFocus) focusChoice(pendingFocus); };
    if (wait > 0) timer = win.setTimeout(finish, wait); else finish();
  }
  function open({ focus = false } = {}) {
    if (opened || !root.isConnected) return;
    opened = true;
    trigger.setAttribute('aria-expanded', 'true');
    panel.inert = false;
    root.toggleAttribute('data-open', true);
    measure();
    pendingFocus = focus || null;
    settle('opening', 'open');
    // a panel hidden behind turning slats or flying shards can't take focus yet: settle()
    // hands it over once open; any other panel takes it now
    if (pendingFocus && !layer) focusChoice(pendingFocus);
  }
  function close({ restoreFocus = false } = {}) {
    if (!opened) return;
    opened = false;
    pendingFocus = null;
    trigger.setAttribute('aria-expanded', 'false');
    panel.inert = true;
    root.toggleAttribute('data-open', false);
    measure();
    settle('closing', 'closed');
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  function onTriggerClick(event) {
    if (opened) close(); else open({ focus: event.detail === 0 ? 'first' : false });
  }
  function onKeydown(event) {
    if (event.key === 'Escape' && opened) {
      event.preventDefault(); event.stopPropagation(); close({ restoreFocus: true }); return;
    }
    if (event.target === trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if (opened) focusChoice(event.key === 'ArrowUp' ? 'last' : 'first');
      else open({ focus: event.key === 'ArrowUp' ? 'last' : 'first' });
      return;
    }
    if (!opened) return;
    const list = choices();
    const current = list.indexOf(event.target.closest?.('a[href]'));
    if (current < 0) return;
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % list.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + list.length) % list.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else return;
    event.preventDefault(); list[next].focus();
  }
  function onPanelClick(event) {
    if (event.target.closest('[data-dd-close]')) { close({ restoreFocus: true }); return; }
    const link = event.target.closest('a[href]');
    if (link && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) close({ restoreFocus: true });
  }
  function onFocusout(event) {
    if (event.relatedTarget && event.relatedTarget !== trigger && !panel.contains(event.relatedTarget)) close();
  }
  function onPointerdown(event) {
    if (opened && !trigger.contains(event.target) && !panel.contains(event.target)) close();
  }

  trigger.setAttribute('aria-expanded', 'false');
  panel.inert = true;
  root.dataset.phase = 'closed';
  measure();
  trigger.addEventListener('click', onTriggerClick);
  root.addEventListener('keydown', onKeydown);
  root.addEventListener('focusout', onFocusout);
  panel.addEventListener('click', onPanelClick);
  doc.addEventListener('pointerdown', onPointerdown, true);
  const observer = new win.ResizeObserver(() => measure());
  observer.observe(panel);

  const controller = {
    element: trigger, open, close,
    get opened() { return opened; },
    destroy() {
      close();
      win.clearTimeout(timer);
      observer.disconnect();
      trigger.removeEventListener('click', onTriggerClick);
      root.removeEventListener('keydown', onKeydown);
      root.removeEventListener('focusout', onFocusout);
      panel.removeEventListener('click', onPanelClick);
      doc.removeEventListener('pointerdown', onPointerdown, true);
      layer?.remove();
      choosers.delete(root);
    }
  };
  choosers.set(root, controller);
  return controller;
}

/** Every chooser inside `scope`; destroy() releases them all. */
export function mountDownloadChoosers(scope = document) {
  const list = [...scope.querySelectorAll('[data-dd-chooser]')].map(createDownloadChooser);
  return { controllers: list, destroy() { list.forEach(controller => controller.destroy()); } };
}

// ---- the data every design reads ---------------------------------------------------------
const PACKAGES = {
  full: { title: 'Full game', short: 'First install', icon: 'folder', blurb: 'Game files, DLLs and assets. For your first install or when the assets change.' },
  update: { title: 'Update only', short: 'Over your game folder', icon: 'refresh', blurb: 'Executable, DLLs and .cgsmap. Extract over your existing game folder.' }
};
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ESCAPES[character]);

/**
 * Fill in a design's data. `full` and `update` are the packages ({ size, href, file?, title?,
 * short?, blurb? }); `update` may be null. `note` ({ tone, label, text }) sits under the choices.
 */
export function downloadData(data = {}) {
  const pack = key => (data[key] ? { ...PACKAGES[key], href: '#', file: '', size: '', ...data[key], key } : null);
  const full = pack('full') ?? { ...PACKAGES.full, href: '#', file: '', size: '', key: 'full' };
  const update = pack('update');
  const number = data.number ?? '';
  const count = Math.max(0, Math.floor(Number(data.count) || 0));
  return {
    number, commit: String(data.commit ?? ''), age: String(data.age ?? ''), count,
    place: data.place ?? 'Paradise City', site: data.site ?? '', month: data.month ?? '', platform: data.platform ?? 'PC',
    previous: data.previous ?? (Number.isFinite(Number(number)) && String(number) !== '' ? Number(number) - 1 : ''),
    full, update, packages: [full, update].filter(Boolean),
    note: data.note === undefined ? { tone: 'success', label: 'Assets unchanged', text: 'Already have the game folder? Update only is all you need.' } : data.note
  };
}

/** The sample the gallery shows: build 179, its full game and its update. */
export const sampleDownload = {
  number: 179, commit: '3add8ad', age: '3h ago', count: 128, month: 'NOV', site: 'decomp.adriwin.fr',
  full: { size: '4.69 GB', href: '../docs/integration.md', file: 'sample-full-game-guide.md' },
  update: { size: '8.2 MB', href: '../CHANGELOG.md', file: 'sample-update-notes.md' }
};

// ---- markup helpers ---------------------------------------------------------------------
const icons = new URL('./assets/icons.svg', import.meta.url).href;
const icon = name => `<svg class="b5-icon" aria-hidden="true"><use href="${icons}#${name}"></use></svg>`;
const trigger = p => `id="${p}" type="button" aria-expanded="false" aria-controls="${p}-menu" data-dd-trigger`;
const panel = (p, className, inner) => `<div class="dd-chooser ${className}" id="${p}-menu" role="region" aria-labelledby="${p}-menu-title" data-dd-panel inert>${inner}</div>`;
const heading = (p, className = 'b5-sr-only', text = 'Choose your download') => `<span class="${className}" id="${p}-menu-title">${text}</span>`;
const noteInner = note => (note ? `${note.label ? `<span class="b5-status"${note.tone ? ` data-tone="${esc(note.tone)}"` : ''}>${esc(note.label)}</span> ` : ''}<span>${esc(note.text)}</span>` : '');
const note = (d, className) => `<p class="dd-note ${className}" data-dl="note"${d.note ? '' : ' hidden'}>${noteInner(d.note)}</p>`;
const link = (item, className, inner) => `<a class="dd-choice dd-choice--${item.key} ${className}" href="${esc(item.href)}"${item.file ? ` download="${esc(item.file)}"` : ''}>${inner}</a>`;
const spoken = item => `<span class="b5-sr-only">, ${esc(item.blurb)}</span>`;
const turnBack = (className, what) => `<button class="dd-turn ${className}" type="button" data-dd-close aria-label="Turn the ${what} back">${icon('refresh')}</button>`;
const preview = (className, dialog, extra = '') => `<button class="${className}" type="button" data-dl="preview"${dialog ? ` data-b5-dialog-open="${esc(dialog)}"` : ''}${extra} aria-label="Preview build contents">${icon('eye')}</button>`;
const downloads = count => `${count} download${count === 1 ? '' : 's'}`;
// what assistive tech hears after a design's visible label: the build, its commit and its count
const said = d => `<span class="b5-sr-only"> ${d.number !== '' ? `number ${esc(d.number)}, ` : ''}${d.commit ? `commit ${esc(d.commit)}, ` : ''}<span data-dl="downloads">${downloads(d.count)}</span>, </span>`;
const plateNumber = d => esc(d.commit.slice(0, 7).toUpperCase());
const age = d => `<span data-dl="age">${esc(d.age)}</span>`;
const meta = d => [d.age ? age(d) : '', esc(d.full.size)].filter(Boolean).join(' · ');
const figure = size => /^\s*([\d.,]+)\s*(\S*)/.exec(size || '') ?? [size, size, ''];

// ---- bars: a panel slides out from under the bar ------------------------------------------
const tooltipEye = (p, dialog) => `<span class="b5-tooltip">${preview('b5-download-preview', dialog, ` aria-describedby="${p}-tooltip"`)}<span id="${p}-tooltip" role="tooltip">Preview the build's contents</span></span>`;
const plate = d => (d.commit ? `<span class="b5-plate" aria-hidden="true"><span class="b5-plate__state">${esc(d.place)}</span><span class="b5-plate__number">${plateNumber(d)}</span></span>` : '');
// the tachometer's chooser: each package a gear with its shift lights; the needle follows
const shift = (p, d) => panel(p, 'dd-shift', `${heading(p, 'dd-shift__title')}${d.packages.map(item => link(item, 'dd-shift__gear',
  `<span class="dd-shift__lights" aria-hidden="true">${'<i></i>'.repeat(10)}</span><span class="dd-shift__name">${esc(item.title)}</span><span class="dd-shift__size">${esc(item.size)}</span><span class="dd-shift__blurb">${esc(item.blurb)}</span>`)).join('')}${note(d, 'dd-shift__note')}`);
// the dashboard's: a trip computer whose drums roll to each package's size
const drums = digits => [...digits].map(digit => (/\d/.test(digit) ? `<span class="dd-drum dd-d${digit}"><span>${[...'0123456789'].map(n => `<i>${n}</i>`).join('')}</span></span>` : `<span class="dd-drum-dot">${esc(digit)}</span>`)).join('');
const trip = (p, d) => panel(p, 'dd-trip', `${heading(p, 'dd-trip__title')}${d.packages.map((item, index) => {
  const [, digits, unit] = figure(item.size);
  return link(item, 'dd-trip__row', `<span class="dd-trip__tag" aria-hidden="true">Trip ${'AB'[index]}</span><span class="dd-trip__name">${esc(item.title)}</span><span class="dd-trip__size"><span class="dd-drums" aria-hidden="true">${drums(digits)}</span><small aria-hidden="true">${esc(unit)}</small><span class="b5-sr-only">${esc(item.size)}</span></span><span class="dd-trip__blurb">${esc(item.blurb)}</span>`);
}).join('')}${note(d, 'dd-trip__note')}`);
// the classic bar's: two strokes of paint
const strokes = (p, d) => panel(p, 'dd-strokes', `${heading(p)}${d.packages.map(item => link(item, 'dd-stroke',
  `<span class="dd-stroke__icon" aria-hidden="true">${icon(item.icon)}</span><span class="dd-stroke__name">${esc(item.title)}</span><span class="dd-stroke__size">${esc(item.size)}</span><span class="dd-stroke__blurb">${esc(item.blurb)}</span>`)).join('')}${note(d, 'dd-stroke__note')}`);
const odometer = d => `<span data-b5-odometer="${d.count}"></span>`;

// ---- road signs: the road splits into two lanes, a sign over each ----------------------------
const ARROW = '<svg class="b5-sign__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const SMALL_ARROW = '<svg viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const LANE_ARROW = '<svg class="dd-lane__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg>';
const shield = d => ('<span class="sv-shield" aria-hidden="true"><svg viewBox="0 0 66 72"><path class="sv-shield__edge" d="M33 1C25 5 12 5 3 2 0 22 1 42 10 56c7 9 16 12 23 15 7-3 16-6 23-15 9-14 10-34 7-54-9 3-22 3-30-1Z"/>'
  + '<path class="sv-shield__body" d="M33 5C25 9 14 9 6 7 4 24 5 41 13 53c6 8 13 11 20 14 7-3 14-6 20-14 8-12 9-29 7-46-8 2-19 2-27-2Z"/>'
  + `<path class="sv-shield__top" d="M33 5C25 9 14 9 6 7l-.3 14h54.6L60 7c-8 2-19 2-27-2Z"/></svg><small>${esc(d.platform)}</small><b>${esc(d.number)}</b></span>`);
const laneHeads = {
  none: () => '',
  tab: (d, index) => `<span class="dd-lane__tab" aria-hidden="true">Exit ${esc(d.number)}${'AB'[index]}</span>`,
  shield: (d, index) => `<span class="dd-lane__shield" aria-hidden="true"><small>${esc(d.platform)}</small><b>${esc(d.number)}${'AB'[index]}</b></span>`
};
const lanes = (p, d, head, band) => panel(p, 'dd-lanes', `${heading(p)}<span class="dd-lanes__row">${d.packages.map((item, index) => link(item, `dd-lane${band ? ' dd-lane--band' : ''}`,
  `<span class="dd-lane__lamp" aria-hidden="true"></span>${laneHeads[head](d, index)}<span class="dd-lane__text"><span class="dd-lane__name">${esc(item.title)}</span><span class="dd-lane__size">${esc(item.size)}</span></span>${band ? `<span class="dd-lane__band" aria-hidden="true">${SMALL_ARROW}<span>${esc(item.short)}</span>${SMALL_ARROW}</span>` : LANE_ARROW}${spoken(item)}`)).join('')}</span>${note(d, 'dd-lanes__note')}`);
// the message sign changes with the sign's state: the count, the build when the sign is pointed
// at, an instruction once open, and the size of the lane pointed at
const vms = d => {
  const states = [['hover', 'NEW', `BUILD ${d.number}`], ['open', 'PICK', 'A LANE'], ...d.packages.map(item => { const [, digits, unit] = figure(item.size); return [item.key, digits, unit]; })];
  return `<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value" data-dl="count">${d.count}</span><span class="b5-vms__label" data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</span>${states.map(([state, big, small]) => `<span class="dd-vms dd-vms--${state}"><b>${esc(big)}</b><small>${esc(small)}</small></span>`).join('')}</span>`;
};
const legend = d => `<span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small>${said(d)}${esc(d.place)} · ${esc(d.full.size)}</small></span>`;
const sign = ({ modifier = '', inside, extra = () => '', head = 'none', band = false }) => (p, d, { dialog } = {}) => `<div class="b5-download-group b5-download-group--sign dd-sign${modifier ? ` ${modifier}` : ''}" id="${p}-group" data-dd-chooser>
<div class="b5-sign">
<button class="b5-download" ${trigger(p)}><span class="b5-sign__lamps" aria-hidden="true"></span>${inside(d)}</button>
${lanes(p, d, head, band)}
${vms(d)}${extra(d)}
<span class="b5-sign__plaque">${preview('b5-download-preview', dialog)}<span>commit ${esc(d.commit)} · ${age(d)}</span></span>
</div>
</div>`;

// ---- licence plates: the plate revolves to show its back ---------------------------------------
const knob = (className, dialog) => preview(`knob${className ? ` ${className}` : ''}`, dialog);
const HOLES = '<i class="lp-hole lp-hole--1"></i><i class="lp-hole lp-hole--2"></i><i class="lp-hole lp-hole--3"></i><i class="lp-hole lp-hole--4"></i>';
const plateTop = d => `<span class="lp-top" aria-hidden="true"><span class="lp-month">${esc(d.month || d.platform)}</span><span class="lp-flag"></span><span class="lp-logo"><span class="lp-seal"></span><span class="lp-script">${esc(d.place)}</span></span><span class="lp-flag lp-flag--r"></span><span class="lp-year"><small>${esc(d.platform)}</small>${esc(d.number)}</span></span>`;
const plateBack = (p, d, modifier) => panel(p, `lp lp-back${modifier}`, `${HOLES}<span class="lp-top lp-back__top"><span class="lp-month" aria-hidden="true">${esc(d.number)}</span>${heading(p, 'lp-script lp-back__title')}${turnBack('lp-back__turn', 'plate')}</span>`
  + `<span class="lp-back__choices">${d.packages.map(item => link(item, 'lp-back__choice', `<span class="lp-back__name">${esc(item.title)}</span><span class="lp-back__size">${esc(item.size)}</span><span class="lp-back__short" aria-hidden="true">${esc(item.short)}</span>${spoken(item)}`)).join('')}</span>${note(d, 'lp-back__note')}`);
const lp = ({ modifier = '', main, url, meta: plateMeta }) => (p, d, { dialog } = {}) => `<div class="dd">
<div class="lpw" data-dd-chooser>
<div class="dd-revolve">
<button class="lp${modifier}" ${trigger(p)}>
${HOLES}
${plateTop(d)}
${main(d)}
${url(d)}
</button>
${plateBack(p, d, modifier)}
</div>
<div class="lp-meta">${knob('', dialog)}<span>${plateMeta(d)}</span></div>
</div>
</div>`;
const plateCount = d => `<b data-dl="count">${d.count}</b> <span data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</span>`;
const BOLTS = '<span class="pl-bolt pl-bolt--tl"></span><span class="pl-bolt pl-bolt--tr"></span><span class="pl-bolt pl-bolt--bl"></span><span class="pl-bolt pl-bolt--br"></span>';
const odoDigits = count => [...String(count).padStart(3, '0')].map(digit => `<i>${digit}</i>`).join('');

// ---- billboards: the board turns over in slats, shatters, or gets a new poster ---------------
const CHEVRONS = '<svg class="bb-chevrons" viewBox="0 0 60 92" aria-hidden="true"><path d="M6 6 30 26 54 6"/><path d="M6 36 30 56 54 36"/><path d="M6 66 30 86 54 66"/></svg>';
const cplate = (d, className) => (d.commit ? `<span class="cplate ${className}" aria-hidden="true"><span class="cplate__state">${esc(d.place)}</span><span class="cplate__number">${plateNumber(d)}</span></span>` : '');
const RIG = '<span class="bb-catwalk"></span>\n<span class="bb-lamps"><i></i><i></i><i></i></span>\n<span class="bb-legs"><i></i></span>';
const tally = d => `<span class="bb-tally"><b data-dl="count">${d.count}</b><small>Smashed</small></span>`;
const posterChoices = d => d.packages.map(item => link(item, 'dd-poster__choice', `<span class="dd-poster__name">${esc(item.title)}</span><span class="dd-poster__size">${esc(item.size)}</span><span class="dd-poster__short" aria-hidden="true">${esc(item.short)}</span>${spoken(item)}`)).join('');
const poster = (p, d, modifier, extra = '') => `<div class="dd-poster ${modifier}">${extra}${heading(p, 'dd-poster__kicker')}<span class="dd-poster__choices">${posterChoices(d)}</span>${note(d, 'dd-poster__note')}${turnBack('dd-poster__turn', 'billboard')}</div>`;
const SHARDS = '<svg class="bx-shards" viewBox="0 0 520 210" preserveAspectRatio="none" aria-hidden="true"><path class="cr" d="M84 122 L40 60 L8 30 M84 122 L30 140 L0 150 M84 122 L60 196 M84 122 L150 70 L188 20 M84 122 L170 170 L230 210"/>'
  + '<polygon points="168,26 214,14 196,58"/><polygon points="398,150 462,138 440,196 404,186"/><polygon points="248,170 272,152 286,186"/><polygon points="34,170 58,160 52,192"/><polygon points="450,28 480,20 470,50"/><polygon points="330,8 352,4 344,26"/><polygon points="124,30 140,22 136,44"/></svg>';
const boardFooter = (d, dialog, eye, metaClass) => `${knob(eye, dialog)}\n<span class="${metaClass}">commit ${esc(d.commit)} · ${age(d)}</span>\n${tally(d)}`;
const blast = modifier => (p, d, { dialog } = {}) => `<div class="dd">
<div class="bx ${modifier}" data-dd-chooser data-dd-effect="shatter">
<button class="bx-board" ${trigger(p)}>
<span class="bx-face" data-dd-face>
<span class="bx-art" aria-hidden="true"></span>
<span class="bx-sparks" aria-hidden="true"></span>
<span class="bx-word" data-text="Download">Download</span>${said(d).replace(', </span>', '</span>')}
${SHARDS}
<span class="bx-planks" aria-hidden="true"></span>
<span class="bx-flyer" aria-hidden="true"><b>Build No. ${esc(d.number)}</b><small>${esc(d.place)} · ${esc(d.full.size)} ▾</small></span>
${cplate(d, 'bx-plate')}
</span>
</button>
${panel(p, 'dd-board-panel', poster(p, d, 'dd-poster--blast', '<span class="bx-art"></span><span class="bx-sparks"></span><span class="bx-planks"></span>'))}
<span class="bx-base"><i></i><i></i><i></i><i></i></span>
${boardFooter(d, dialog, 'bx-eye', 'bx-meta')}
</div>
</div>`;

/** Every design: { id, group, code, label, note, skins, markup(prefix, data, { dialog }) }. */
export const downloadDesigns = [
  { id: 'cluster', group: 'Bar', code: 'X1', label: 'Tachometer cluster', note: 'a gauge pod', skins: true,
    markup: (p, d, { dialog } = {}) => `<div class="dd-bar dd-bar--cluster" data-dd-chooser data-dd-room>
<div class="b5-download-group b5-download-group--cluster" id="${p}-group">
  <button class="b5-download" ${trigger(p)} data-skin="tireburn">
    <span class="b5-download__boost" aria-hidden="true"></span>
    <span class="b5-gauge" data-b5-gauge aria-hidden="true"><span class="b5-gauge__badge">No. ${esc(d.number)}</span>${odometer(d)}<span class="b5-gauge__unit" data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</span></span>
    ${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta">${plate(d)}<small>${said(d)}${meta(d)}</small></span></span>
  </button>
  ${shift(p, d)}
  ${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'dashboard', group: 'Bar', code: 'X2', label: 'Dashboard bar', note: 'plate, odometer, boost', skins: true,
    markup: (p, d, { dialog } = {}) => `<div class="dd-bar dd-bar--dash" data-dd-chooser data-dd-room>
<div class="b5-download-group" id="${p}-group">
<button class="b5-download" ${trigger(p)} data-skin="tireburn">
<span class="b5-download__boost" aria-hidden="true"></span>${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta">${plate(d)}<small>${said(d)}No. ${esc(d.number)} · ${meta(d)}</small></span></span>
</button>
${trip(p, d)}
<span class="b5-download-counter" aria-hidden="true">${odometer(d)}<small data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</small></span>
${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'classic', group: 'Bar', code: 'X3', label: 'Classic bar', note: 'the first one', skins: true,
    markup: (p, d, { dialog } = {}) => `<div class="dd-bar dd-bar--classic" data-dd-chooser data-dd-room>
<div class="b5-download-group" id="${p}-group">
<button class="b5-download" ${trigger(p)} data-skin="tireburn">
${icon('download')}<span><strong>Download build</strong><small>${said(d)}${meta(d)}</small></span>
</button>
${strokes(p, d)}
<span class="b5-download-counter" aria-hidden="true"><strong data-dl="count">${d.count}</strong><small data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</small></span>
${tooltipEye(p, dialog)}
</div>
</div>` },
  { id: 'sign', group: 'Road sign', code: 'B1', label: 'Guide sign', note: 'green, an exit tab', skins: false,
    markup: sign({ head: 'tab', inside: d => `<span class="b5-sign__tab" aria-hidden="true">Exit ${esc(d.number)}</span>${legend(d)}${ARROW}` }) },
  { id: 'sign-game', group: 'Road sign', code: 'B2', label: 'Paradise sign', note: 'game style', skins: false,
    markup: sign({ modifier: 'sv-game', inside: d => `<span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small class="b5-sr-only">${said(d)}${esc(d.place)}, ${esc(d.full.size)}</small></span>${ARROW}`, extra: d => `<span class="sv-supp" aria-hidden="true">Build ${esc(d.number)} · ${esc(d.full.size)} <i>▾</i></span>` }) },
  { id: 'sign-exit', group: 'Road sign', code: 'B3', label: 'Exit only', note: 'yellow panel', skins: false,
    markup: sign({ modifier: 'sv-only', band: true, inside: d => `${legend(d)}<span class="sv-only-band" aria-hidden="true">${SMALL_ARROW}<span>Build ${esc(d.number)}</span>${SMALL_ARROW}</span>` }) },
  { id: 'sign-route', group: 'Road sign', code: 'B4', label: 'Route shield', note: 'interstate', skins: false,
    markup: sign({ modifier: 'sv-route', head: 'shield', inside: d => `${shield(d)}${legend(d)}${ARROW}` }) },
  { id: 'plate-sunset', group: 'Licence plate', code: 'A1', label: 'Sunset plate', note: 'a motors plate frame', skins: false,
    markup: (p, d, { dialog } = {}) => `<div class="dd">
<div class="pl" data-dd-chooser>
<div class="dd-revolve">
<button class="pl-plate" ${trigger(p)}>
${BOLTS}
<span class="pl-state" aria-hidden="true">${esc(d.place)}</span>
<span class="pl-number" aria-hidden="true">${plateNumber(d)}</span>
<span class="pl-slogan"><span aria-hidden="true">↓ </span>Download build${said(d).replace(', </span>', '</span>')}<span aria-hidden="true"> ▾</span></span>
<span class="pl-odo" aria-hidden="true"><span class="odo" data-dl="odo">${odoDigits(d.count)}</span><small data-dl="downloads-word">${d.count === 1 ? 'Download' : 'Downloads'}</small></span>
<span class="pl-sticker" aria-hidden="true"><b>${esc(d.number)}</b><small>Build</small></span>
</button>
${panel(p, 'pl-plate pl-back', `${BOLTS}${heading(p, 'pl-state pl-back__title')}<span class="pl-back__choices">${d.packages.map(item => link(item, 'pl-back__choice', `<span class="pl-back__name">${esc(item.title)}</span><span class="pl-back__size">${esc(item.size)}</span>${spoken(item)}`)).join('')}</span><span class="pl-back__foot">${note(d, 'pl-back__note')}${turnBack('pl-back__turn', 'plate')}</span>`)}
</div>
<span class="pl-motors" aria-hidden="true">Paradise Motors · ${esc(d.full.size)} · ${age(d)}</span>
${knob('pl-eye', dialog)}
</div>
</div>` },
  { id: 'plate-paradise', group: 'Licence plate', code: 'A2', label: 'Paradise plate', note: 'closest to the game', skins: false,
    markup: lp({ main: d => `<span class="lp-main">Download</span>${said(d).replace(', </span>', '</span>')}`, url: d => `<span class="lp-url" aria-hidden="true">${esc(d.site.toUpperCase())} <i>▾</i></span>`, meta: d => `${plateCount(d)} · ${esc(d.full.size)} · commit ${esc(d.commit)} · ${age(d)}` }) },
  { id: 'plate-registration', group: 'Licence plate', code: 'A3', label: 'Registration', note: 'commit embossed', skins: false,
    markup: lp({ main: d => `<span class="lp-main lp-main--reg" aria-hidden="true">${plateNumber(d)}</span>`, url: d => `<span class="lp-url lp-url--cta"><span aria-hidden="true">▼ </span>Download the build${said(d).replace(', </span>', '</span>')}<span aria-hidden="true"> ▾</span></span>`, meta: d => `${plateCount(d)} · ${esc(d.full.size)} · ${age(d)}` }) },
  { id: 'plate-night', group: 'Licence plate', code: 'A4', label: 'Night plate', note: 'site colours', skins: false,
    markup: lp({ modifier: ' lp--night', main: d => `<span class="lp-main">Download</span>${said(d).replace(', </span>', '</span>')}`, url: d => `<span class="lp-url" aria-hidden="true">${esc(d.site.toUpperCase())} <i>▾</i></span>`, meta: d => `${plateCount(d)} · ${esc(d.full.size)} · commit ${esc(d.commit)} · ${age(d)}` }) },
  { id: 'billboard', group: 'Billboard', code: 'C1', label: 'Billboard', note: 'turns over in slats', skins: false,
    markup: (p, d, { dialog } = {}) => `<div class="dd">
<div class="bb" data-dd-chooser data-dd-effect="slats">
<div class="bb-rig">
<button class="bb-board" ${trigger(p)}>
<span class="bb-poster" aria-hidden="true"></span>
<span class="bb-wash" aria-hidden="true"></span>
<span class="bb-kicker" aria-hidden="true">New build · No. ${esc(d.number)}</span>
<strong class="bb-title">Download</strong>${said(d).replace(', </span>', '</span>')}
<span class="bb-sub" aria-hidden="true">${esc(d.place)} · ${esc(d.full.size)} <i>▾</i></span>
${CHEVRONS}
${cplate(d, 'bb-plate')}
<svg class="bb-cracks" viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true"><path d="M262 78 L300 30 L322 8 M262 78 L330 70 L392 82 M262 78 L298 120 L318 166 M262 78 L222 128 L200 168 M262 78 L214 54 L170 18 M300 30 L284 4 M330 70 L352 46 M298 120 L338 138"/></svg>
</button>
${panel(p, 'dd-board-panel', poster(p, d, 'dd-poster--trivision'))}
${RIG}
</div>
${boardFooter(d, dialog, 'bb-eye', 'bb-meta')}
</div>
</div>` },
  { id: 'billboard-fire', group: 'Billboard', code: 'C2', label: 'Blast', note: 'fire, shatters', skins: false, markup: blast('bx--fire') },
  { id: 'billboard-paint', group: 'Billboard', code: 'C3', label: 'Blast', note: 'site colours, shatters', skins: false, markup: blast('bx--paint') },
  { id: 'billboard-pasted', group: 'Billboard', code: 'C4', label: 'Pasted over', note: 'a new poster each build', skins: false,
    markup: (p, d, { dialog } = {}) => `<div class="dd">
<div class="bb bp" data-dd-chooser>
<div class="bb-rig">
<button class="bb-board" ${trigger(p)}>
<span class="bp-old" aria-hidden="true">${d.previous !== '' ? `<span class="bp-old__kicker">Build No. ${esc(d.previous)}</span><span class="bp-old__title">No. ${esc(d.previous)}</span>` : ''}</span>
<span class="bp-new">
<span class="bp-kicker" aria-hidden="true">New build · No. ${esc(d.number)}</span>
<strong class="bp-title">Download</strong>${said(d).replace(', </span>', '</span>')}
<span class="bp-sub" aria-hidden="true">${esc(d.place)} · ${esc(d.full.size)} <i>▾</i></span>
${CHEVRONS.replace('class="bb-chevrons"', 'class="bb-chevrons bp-chevrons"')}
${cplate(d, 'bp-plate')}
</span>
<svg class="bp-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="57,0 58.5,4 60,1.5 62.5,6 64,3 66.5,9.5 69,6.5 70.5,12 73.5,10 75,16.5 77.5,14 80,22 82,19 84,27.5 86.5,25.5 88,31 91,29.5 92.5,37 95.5,34.5 97.5,41 100,40" vector-effect="non-scaling-stroke"/><polyline class="bits" points="66.5,9.5 67.5,13" vector-effect="non-scaling-stroke"/></svg>
</button>
${panel(p, 'dd-board-panel dd-paste', `${poster(p, d, 'dd-poster--paste')}<span class="dd-paste__roller" aria-hidden="true"></span>`)}
${RIG}
</div>
${boardFooter(d, dialog, 'bb-eye', 'bb-meta')}
</div>
</div>` }
];

// ---- one design in a slot ------------------------------------------------------------------
const structure = d => JSON.stringify([d.number, d.commit, d.place, d.site, d.month, d.platform, d.previous, d.packages]);
const noteNodes = (doc, note) => {
  if (!note) return [];
  const nodes = [];
  if (note.label) {
    const status = doc.createElement('span');
    status.className = 'b5-status';
    if (note.tone) status.dataset.tone = note.tone;
    status.textContent = note.label;
    nodes.push(status, doc.createTextNode(' '));
  }
  const text = doc.createElement('span');
  text.textContent = note.text ?? '';
  nodes.push(text);
  return nodes;
};

/**
 * Draw `design` (an id from downloadDesigns) into `slot` and make it work.
 * - data: see downloadData(); prefix: the trigger's id (its chooser is `${prefix}-menu`);
 * - dialog: a dialog id the preview button opens through the library's dialog opener;
 * - onChoose(package, event): runs before the chooser reacts; preventDefault() keeps it open
 *   (to check a quota first, say) and then the app closes it with close();
 * - onPreview(event): the preview (eye) button was pressed.
 */
export function renderDownloadDesign(slot, design, { prefix = 'download', data = {}, dialog = '', onChoose, onPreview } = {}) {
  const chosen = downloadDesigns.find(item => item.id === design);
  if (!chosen) throw new RangeError(`Unknown download design: ${design}`);
  let current = downloadData(data);
  let chooser = null;
  function draw() {
    chooser?.destroy();
    slot.innerHTML = chosen.markup(prefix, current, { dialog });
    slot.dataset.downloadDesign = chosen.id;
    slot.querySelectorAll('[data-b5-gauge]').forEach(element => renderGauge(element));
    slot.querySelectorAll('[data-b5-odometer]').forEach(element => setOdometer(element, current.count, { digits: 3 }));
    chooser = createDownloadChooser(slot.querySelector('[data-dd-chooser]'));
  }
  function onClick(event) {
    const choice = event.target.closest('a.dd-choice');
    if (choice && onChoose) {
      const key = [...choice.classList].find(name => name.startsWith('dd-choice--'))?.slice('dd-choice--'.length);
      const item = current.packages.find(entry => entry.key === key);
      if (item) onChoose(item, event);
      return;
    }
    if (event.target.closest('[data-dl="preview"]') && onPreview) onPreview(event);
  }
  function setNote(next) {
    current.note = next ?? null;
    for (const element of slot.querySelectorAll('[data-dl="note"]')) {
      element.replaceChildren(...noteNodes(slot.ownerDocument, current.note));
      element.hidden = !current.note;
    }
  }
  slot.addEventListener('click', onClick, true);
  draw();
  return {
    get element() { return slot.querySelector('[data-dd-trigger]'); },
    get design() { return chosen.id; },
    get opened() { return chooser.opened; },
    open: options => chooser.open(options),
    close: options => chooser.close(options),
    /** A new build redraws the design; a new count, age or note changes in place. */
    update(next) {
      const fresh = downloadData(next);
      if (structure(fresh) !== structure(current)) { current = fresh; draw(); return; }
      current = fresh;
      for (const element of slot.querySelectorAll('[data-dl="count"]')) element.textContent = String(current.count);
      for (const element of slot.querySelectorAll('[data-dl="downloads"]')) element.textContent = downloads(current.count);
      for (const element of slot.querySelectorAll('[data-dl="downloads-word"]')) element.textContent = current.count === 1 ? 'Download' : 'Downloads';
      for (const element of slot.querySelectorAll('[data-dl="age"]')) element.textContent = current.age;
      for (const element of slot.querySelectorAll('[data-dl="odo"]')) element.innerHTML = odoDigits(current.count);
      for (const element of slot.querySelectorAll('[data-b5-odometer]')) setOdometer(element, current.count, { digits: 3 });
      setNote(current.note);
    },
    /** Replace the note under the choices ({ tone, label, text }); null hides it. */
    setNote,
    destroy() {
      chooser?.destroy();
      slot.removeEventListener('click', onClick, true);
      slot.replaceChildren();
      delete slot.dataset.downloadDesign;
    }
  };
}
