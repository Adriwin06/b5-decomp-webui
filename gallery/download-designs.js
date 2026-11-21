// Every download design, for the gallery's Design switch and the side-by-side page
// (download-designs.html). markup(prefix, dialogId) builds one design: the prefix names
// its button (the prefix itself), group and menu; dialogId, when given, is the dialog
// its preview opens. The bars and the guide sign are library components; the other
// signs, the plates and the billboards are explorations (download-designs.css).
const icon = name => `<svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#${name}"></use></svg>`;

export const menu = p => `<div class="b5-download-menu" id="${p}-menu" popover="auto" role="region" aria-labelledby="${p}-menu-title">
    <header class="b5-download-menu__header"><span class="b5-eyebrow" id="${p}-menu-title">Choose your download</span><span class="b5-muted">v0.2.0</span></header>
    <a class="b5-download-option" href="../docs/integration.md" download="sample-full-game-guide.md">
      <span class="b5-download-option__icon" aria-hidden="true">${icon('folder')}</span>
      <span class="b5-download-option__title">Full game</span><span class="b5-download-option__size">4.69 GB</span>
      <span class="b5-download-option__description">Game files, DLLs and assets. For your first install or when the assets change.</span>
    </a>
    <a class="b5-download-option" href="../CHANGELOG.md" download="sample-update-notes.md">
      <span class="b5-download-option__icon" aria-hidden="true">${icon('refresh')}</span>
      <span class="b5-download-option__title">Update only</span><span class="b5-download-option__size">8.2 MB</span>
      <span class="b5-download-option__description">Executable, DLLs and .cgsmap. Extract over your existing game folder.</span>
    </a>
    <footer class="b5-download-menu__note"><span class="b5-status" data-tone="success">Assets unchanged</span><p>Already have the game folder? <strong>Update only</strong> is all you need.</p><small class="b5-hint">Demo packages download sample documentation.</small></footer>
</div>`;

export const downloadDesigns = [
  { id: 'cluster', group: 'Bar', code: 'X1', label: 'Tachometer cluster', note: 'current', skins: true,
    markup: (p, dialog) => `<div class="b5-download-group b5-download-group--cluster" data-b5-download-menu id="${p}-group">
  <button class="b5-download" id="${p}" data-skin="tireburn" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
    <span class="b5-download__boost" aria-hidden="true"></span>
    <span class="b5-gauge" data-b5-gauge aria-hidden="true"><span class="b5-gauge__badge">No. 179</span><span data-b5-odometer="128"></span><span class="b5-gauge__unit">Downloads</span></span>
    ${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta"><span class="b5-plate" aria-hidden="true"><span class="b5-plate__state">Paradise City</span><span class="b5-plate__number">3ADD8AD</span></span><small><span class="b5-sr-only">number 179, commit 3add8ad, 128 downloads, </span>v0.2.0 · PC</small></span></span>
  </button>
  <span class="b5-tooltip"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents" aria-describedby="${p}-tooltip">${icon('eye')}</button><span id="${p}-tooltip" role="tooltip">Preview the sample contents</span></span>
  ${menu(p)}
</div>` },
  { id: 'dashboard', group: 'Bar', code: 'X2', label: 'Dashboard bar', note: 'plate, odometer, boost', skins: true,
    markup: (p, dialog) => `<div class="b5-download-group" data-b5-download-menu id="${p}-group">
<button class="b5-download" id="${p}" data-skin="tireburn" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="b5-download__boost" aria-hidden="true"></span>${icon('download')}<span><strong>Download build</strong><span class="b5-download__meta"><span class="b5-plate" aria-hidden="true"><span class="b5-plate__state">Paradise City</span><span class="b5-plate__number">3ADD8AD</span></span><small><span class="b5-sr-only">number 179, commit 3add8ad, 128 downloads, </span>No. 179 · v0.2.0 · PC</small></span></span>
</button>
<span class="b5-download-counter"><span data-b5-odometer="128"></span><span class="b5-sr-only">128</span><small>Downloads</small></span>
<span class="b5-tooltip"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents" aria-describedby="${p}-tooltip">${icon('eye')}</button><span id="${p}-tooltip" role="tooltip">Preview the sample contents</span></span>
${menu(p)}
</div>` },
  { id: 'classic', group: 'Bar', code: 'X3', label: 'Classic bar', note: 'the first one', skins: true,
    markup: (p, dialog) => `<div class="b5-download-group" data-b5-download-menu id="${p}-group">
<button class="b5-download" id="${p}" data-skin="tireburn" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
${icon('download')}<span><strong>Download build</strong><small>v0.2.0 · PC</small></span>
</button>
<span class="b5-download-counter"><strong>128</strong><small>Downloads</small></span>
<span class="b5-tooltip"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents" aria-describedby="${p}-tooltip">${icon('eye')}</button><span id="${p}-tooltip" role="tooltip">Preview the sample contents</span></span>
${menu(p)}
</div>` },
  { id: 'sign', group: 'Road sign', code: 'B1', label: 'Guide sign', note: 'library', skins: false,
    markup: (p, dialog) => `<div class="b5-download-group b5-download-group--sign" data-b5-download-menu id="${p}-group">
<div class="b5-sign">
<button class="b5-download" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu"><span class="b5-sign__lamps" aria-hidden="true"></span><span class="b5-sign__tab" aria-hidden="true">Exit 179</span><span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small><span class="b5-sr-only">number 179, 128 downloads, </span>Paradise City · 4.69 GB</small></span><svg class="b5-sign__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg></button>
<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value">128</span><span class="b5-vms__label">DOWNLOADS</span></span>
<span class="b5-sign__plaque"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents">${icon('eye')}</button><span>commit 3add8ad · v0.2.0</span></span>
</div>
${menu(p)}
</div>` },
  { id: 'sign-game', group: 'Road sign', code: 'B2', label: 'Paradise sign', note: 'game style', skins: false,
    markup: (p, dialog) => `<div class="b5-download-group b5-download-group--sign sv-game" data-b5-download-menu id="${p}-group">
<div class="b5-sign">
<button class="b5-download" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu"><span class="b5-sign__lamps" aria-hidden="true"></span><span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build number 179, 128 downloads, Paradise City, 4.69 GB</span></strong></span><svg class="b5-sign__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg></button>
<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value">128</span><span class="b5-vms__label">DOWNLOADS</span></span><span class="sv-supp" aria-hidden="true">Build 179 · 4.69 GB <i>▾</i></span>
<span class="b5-sign__plaque"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents">${icon('eye')}</button><span>commit 3add8ad · v0.2.0</span></span>
</div>
${menu(p)}
</div>` },
  { id: 'sign-exit', group: 'Road sign', code: 'B3', label: 'Exit only', note: 'yellow panel', skins: false,
    markup: (p, dialog) => `<div class="b5-download-group b5-download-group--sign sv-only" data-b5-download-menu id="${p}-group">
<div class="b5-sign">
<button class="b5-download" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu"><span class="b5-sign__lamps" aria-hidden="true"></span><span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small><span class="b5-sr-only">number 179, 128 downloads, </span>Paradise City · 4.69 GB</small></span><span class="sv-only-band" aria-hidden="true"><svg viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg><span>Build 179</span><svg viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg></span></button>
<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value">128</span><span class="b5-vms__label">DOWNLOADS</span></span>
<span class="b5-sign__plaque"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents">${icon('eye')}</button><span>commit 3add8ad · v0.2.0</span></span>
</div>
${menu(p)}
</div>` },
  { id: 'sign-route', group: 'Road sign', code: 'B4', label: 'Route shield', note: 'interstate', skins: false,
    markup: (p, dialog) => `<div class="b5-download-group b5-download-group--sign sv-route" data-b5-download-menu id="${p}-group">
<div class="b5-sign">
<button class="b5-download" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu"><span class="b5-sign__lamps" aria-hidden="true"></span><span class="sv-shield" aria-hidden="true"><svg viewBox="0 0 66 72"><path class="sv-shield__edge" d="M33 1C25 5 12 5 3 2 0 22 1 42 10 56c7 9 16 12 23 15 7-3 16-6 23-15 9-14 10-34 7-54-9 3-22 3-30-1Z"/><path class="sv-shield__body" d="M33 5C25 9 14 9 6 7 4 24 5 41 13 53c6 8 13 11 20 14 7-3 14-6 20-14 8-12 9-29 7-46-8 2-19 2-27-2Z"/><path class="sv-shield__top" d="M33 5C25 9 14 9 6 7l-.3 14h54.6L60 7c-8 2-19 2-27-2Z"/></svg><small>PC</small><b>179</b></span><span class="b5-sign__legend"><strong>Download<span class="b5-sr-only"> build</span></strong><small><span class="b5-sr-only">number 179, 128 downloads, </span>Paradise City · 4.69 GB</small></span><svg class="b5-sign__arrow" viewBox="0 0 44 62" aria-hidden="true"><path d="M17 0h10v38h13L22 62 4 38h13z"/></svg></button>
<span class="b5-vms" aria-hidden="true"><span class="b5-vms__value">128</span><span class="b5-vms__label">DOWNLOADS</span></span>
<span class="b5-sign__plaque"><button class="b5-download-preview" type="button" ${dialog ? `data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents">${icon('eye')}</button><span>commit 3add8ad · v0.2.0</span></span>
</div>
${menu(p)}
</div>` },
  { id: 'plate-sunset', group: 'Licence plate', code: 'A1', label: 'Sunset plate', note: 'first plate', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="pl">
<button class="pl-plate" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="pl-bolt pl-bolt--tl"></span><span class="pl-bolt pl-bolt--tr"></span><span class="pl-bolt pl-bolt--bl"></span><span class="pl-bolt pl-bolt--br"></span>
<span class="pl-state">Paradise City</span>
<span class="pl-number">3ADD8AD</span>
<span class="pl-slogan">↓ Download build ▾</span>
<span class="pl-odo"><span class="odo"><i>1</i><i>2</i><i>8</i></span><small>Downloads</small></span>
<span class="pl-sticker"><b>179</b><small>Build</small></span>
</button>
<button class="knob pl-eye" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button>
</div>
${menu(p)}
</div>` },
  { id: 'plate-paradise', group: 'Licence plate', code: 'A2', label: 'Paradise plate', note: 'closest to the game', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="lpw">
<button class="lp" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<i class="lp-hole lp-hole--1"></i><i class="lp-hole lp-hole--2"></i><i class="lp-hole lp-hole--3"></i><i class="lp-hole lp-hole--4"></i>
<span class="lp-top">
<span class="lp-month">NOV</span><span class="lp-flag"></span>
<span class="lp-logo"><span class="lp-seal"></span><span class="lp-script">Paradise City</span></span>
<span class="lp-flag lp-flag--r"></span><span class="lp-year"><small>PC</small>179</span>
</span>
<span class="lp-main">Download</span>
<span class="lp-url">DECOMP.ADRIWIN.FR <i>▾</i></span>
</button>
<div class="lp-meta"><button class="knob" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button><span><b>128</b> downloads · 4.69 GB · commit 3add8ad · 3h ago</span></div>
</div>
${menu(p)}
</div>` },
  { id: 'plate-registration', group: 'Licence plate', code: 'A3', label: 'Registration', note: 'commit embossed', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="lpw">
<button class="lp" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<i class="lp-hole lp-hole--1"></i><i class="lp-hole lp-hole--2"></i><i class="lp-hole lp-hole--3"></i><i class="lp-hole lp-hole--4"></i>
<span class="lp-top">
<span class="lp-month">NOV</span><span class="lp-flag"></span>
<span class="lp-logo"><span class="lp-seal"></span><span class="lp-script">Paradise City</span></span>
<span class="lp-flag lp-flag--r"></span><span class="lp-year"><small>PC</small>179</span>
</span>
<span class="lp-main lp-main--reg">3ADD8AD</span>
<span class="lp-url lp-url--cta">▼ Download the build ▾</span>
</button>
<div class="lp-meta"><button class="knob" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button><span><b>128</b> downloads · 4.69 GB · 3h ago</span></div>
</div>
${menu(p)}
</div>` },
  { id: 'plate-night', group: 'Licence plate', code: 'A4', label: 'Night plate', note: 'site colours', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="lpw">
<button class="lp lp--night" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<i class="lp-hole lp-hole--1"></i><i class="lp-hole lp-hole--2"></i><i class="lp-hole lp-hole--3"></i><i class="lp-hole lp-hole--4"></i>
<span class="lp-top">
<span class="lp-month">NOV</span><span class="lp-flag"></span>
<span class="lp-logo"><span class="lp-seal"></span><span class="lp-script">Paradise City</span></span>
<span class="lp-flag lp-flag--r"></span><span class="lp-year"><small>PC</small>179</span>
</span>
<span class="lp-main">Download</span>
<span class="lp-url">DECOMP.ADRIWIN.FR <i>▾</i></span>
</button>
<div class="lp-meta"><button class="knob" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button><span><b>128</b> downloads · 4.69 GB · commit 3add8ad · 3h ago</span></div>
</div>
${menu(p)}
</div>` },
  { id: 'billboard', group: 'Billboard', code: 'C1', label: 'Billboard', note: 'steel rig', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bb">
<div class="bb-rig">
<button class="bb-board" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="bb-poster"></span>
<span class="bb-wash"></span>
<span class="bb-kicker">New build · No. 179</span>
<strong class="bb-title">Download</strong>
<span class="bb-sub">Paradise City · 4.69 GB <i>▾</i></span>
<svg class="bb-chevrons" viewBox="0 0 60 92" aria-hidden="true"><path d="M6 6 30 26 54 6M6 36 30 56 54 36M6 66 30 86 54 66"/></svg>
<span class="cplate bb-plate"><span class="cplate__state">Paradise City</span><span class="cplate__number">3ADD8AD</span></span>
<svg class="bb-cracks" viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true"><path d="M262 78 L300 30 L322 8 M262 78 L330 70 L392 82 M262 78 L298 120 L318 166 M262 78 L222 128 L200 168 M262 78 L214 54 L170 18 M300 30 L284 4 M330 70 L352 46 M298 120 L338 138"/></svg>
</button>
<span class="bb-catwalk"></span>
<span class="bb-lamps"><i></i><i></i><i></i></span>
<span class="bb-legs"><i></i></span>
</div>
<button class="knob bb-eye" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button>
<span class="bb-meta">commit 3add8ad · 3h ago</span>
<span class="bb-tally"><b>128</b><small>Smashed</small></span>
</div>
${menu(p)}
</div>` },
  { id: 'billboard-fire', group: 'Billboard', code: 'C2', label: 'Blast', note: 'fire', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bx bx--fire">
<button class="bx-board" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="bx-face">
<span class="bx-art"></span>
<span class="bx-sparks"></span>
<span class="bx-word" data-text="Download">Download</span>
<svg class="bx-shards" viewBox="0 0 520 210" preserveAspectRatio="none" aria-hidden="true">
<path class="cr" d="M84 122 L40 60 L8 30 M84 122 L30 140 L0 150 M84 122 L60 196 M84 122 L150 70 L188 20 M84 122 L170 170 L230 210"/>
<polygon points="168,26 214,14 196,58"/><polygon points="398,150 462,138 440,196 404,186"/><polygon points="248,170 272,152 286,186"/><polygon points="34,170 58,160 52,192"/><polygon points="450,28 480,20 470,50"/><polygon points="330,8 352,4 344,26"/><polygon points="124,30 140,22 136,44"/>
</svg>
<span class="bx-planks"></span>
<span class="bx-flyer"><b>Build No. 179</b><small>Paradise City · 4.69 GB ▾</small></span>
<span class="cplate bx-plate"><span class="cplate__state">Paradise City</span><span class="cplate__number">3ADD8AD</span></span>
</span>
</button>
<span class="bx-base"><i></i><i></i><i></i><i></i></span>
<button class="knob bx-eye" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button>
<span class="bx-meta">commit 3add8ad · 3h ago</span>
<span class="bb-tally"><b>128</b><small>Smashed</small></span>
</div>
${menu(p)}
</div>` },
  { id: 'billboard-paint', group: 'Billboard', code: 'C3', label: 'Blast', note: 'site colours', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bx bx--paint">
<button class="bx-board" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="bx-face">
<span class="bx-art"></span>
<span class="bx-sparks"></span>
<span class="bx-word" data-text="Download">Download</span>
<svg class="bx-shards" viewBox="0 0 520 210" preserveAspectRatio="none" aria-hidden="true">
<path class="cr" d="M84 122 L40 60 L8 30 M84 122 L30 140 L0 150 M84 122 L60 196 M84 122 L150 70 L188 20 M84 122 L170 170 L230 210"/>
<polygon points="168,26 214,14 196,58"/><polygon points="398,150 462,138 440,196 404,186"/><polygon points="248,170 272,152 286,186"/><polygon points="34,170 58,160 52,192"/><polygon points="450,28 480,20 470,50"/><polygon points="330,8 352,4 344,26"/><polygon points="124,30 140,22 136,44"/>
</svg>
<span class="bx-planks"></span>
<span class="bx-flyer"><b>Build No. 179</b><small>Paradise City · 4.69 GB ▾</small></span>
<span class="cplate bx-plate"><span class="cplate__state">Paradise City</span><span class="cplate__number">3ADD8AD</span></span>
</span>
</button>
<span class="bx-base"><i></i><i></i><i></i><i></i></span>
<button class="knob bx-eye" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button>
<span class="bx-meta">commit 3add8ad · 3h ago</span>
<span class="bb-tally"><b>128</b><small>Smashed</small></span>
</div>
${menu(p)}
</div>` },
  { id: 'billboard-pasted', group: 'Billboard', code: 'C4', label: 'Pasted over', note: 'build 179 over 178', skins: false,
    markup: (p, dialog) => `<div class="dd">
<div class="bb bp">
<div class="bb-rig">
<button class="bb-board" id="${p}" type="button" popovertarget="${p}-menu" aria-controls="${p}-menu">
<span class="bp-old"><span class="bp-old__kicker">Build No. 178</span><span class="bp-old__title">No. 178</span></span>
<span class="bp-new">
<span class="bp-kicker">New build · No. 179</span>
<strong class="bp-title">Download</strong>
<span class="bp-sub">Paradise City · 4.69 GB <i>▾</i></span>
<span class="cplate bp-plate"><span class="cplate__state">Paradise City</span><span class="cplate__number">3ADD8AD</span></span>
</span>
<svg class="bp-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="57,0 58.5,4 60,1.5 62.5,6 64,3 66.5,9.5 69,6.5 70.5,12 73.5,10 75,16.5 77.5,14 80,22 82,19 84,27.5 86.5,25.5 88,31 91,29.5 92.5,37 95.5,34.5 97.5,41 100,40" vector-effect="non-scaling-stroke"/><polyline class="bits" points="66.5,9.5 67.5,13" vector-effect="non-scaling-stroke"/></svg>
</button>
<span class="bb-catwalk"></span>
<span class="bb-lamps"><i></i><i></i><i></i></span>
<span class="bb-legs"><i></i></span>
</div>
<button class="knob bb-eye" type="button"${dialog ? ` data-b5-dialog-open="${dialog}"` : ""} aria-label="Preview sample contents"><svg class="b5-icon" aria-hidden="true"><use href="../dist/assets/icons.svg#eye"></use></svg></button>
<span class="bb-meta">commit 3add8ad · 3h ago</span>
<span class="bb-tally"><b>128</b><small>Smashed</small></span>
</div>
${menu(p)}
</div>` }
];
