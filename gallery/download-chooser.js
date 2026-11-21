// The download designs' own choosers. Each design opens its two packages in place and in its
// own idiom (a drawer under a bar, lane signs under a road sign, the back of a plate, a
// billboard that turns over, shatters or gets a new poster) instead of the library's
// floating menu. A chooser is a disclosure: the design's main button is its trigger
// (aria-expanded, aria-controls), the panel is a region of links kept inert while closed,
// and Escape, an outside click or a choice closes it, focus going back to the trigger.
//
// Markup: [data-dd-chooser] holds a [data-dd-trigger] button whose aria-controls names a
// [data-dd-panel] inside it. Optional:
// - data-dd-room: the panel hangs below the design, which reserves its height (--dd-room);
// - data-dd-effect="slats" | "shatter": a decorative layer of copies of the design's face
//   turns over in slats, or breaks into shards, between the closed and open states;
// - [data-dd-close] buttons in the panel close it.
// The root carries data-open while open and data-phase (opening, open, closing, closed);
// CSS sets --dd-open-ms and --dd-close-ms for designs whose phases take time.

const controllers = new WeakMap();
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
export function createChooser(root) {
  if (controllers.has(root)) return controllers.get(root);
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
  function settle(phase, after) {
    win.clearTimeout(timer);
    root.dataset.phase = phase;
    const wait = time(phase === 'opening' ? '--dd-open-ms' : '--dd-close-ms');
    const finish = () => { root.dataset.phase = after; if (after === 'open' && pendingFocus) focusChoice(pendingFocus); };
    if (wait > 0) timer = win.setTimeout(finish, wait); else finish();
  }
  function focusChoice(which) {
    pendingFocus = null;
    const list = choices();
    (which === 'last' ? list.at(-1) : list[0])?.focus({ preventScroll: true });
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
      controllers.delete(root);
    }
  };
  controllers.set(root, controller);
  return controller;
}

/** Every chooser inside `scope`; destroy() releases them all. */
export function mountChoosers(scope = document) {
  const list = [...scope.querySelectorAll('[data-dd-chooser]')].map(createChooser);
  return { controllers: list, destroy() { list.forEach(controller => controller.destroy()); } };
}
