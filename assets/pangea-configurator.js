/*
 * Pangea Mini IM configurator. No dependencies.
 * Mounts on every [data-pangea-configurator] element and reads its settings
 * from a child <script type="application/json" data-pc-config>.
 */
(function () {
  'use strict';

  var U = 54;     // px per key unit in the drawing
  var PAD = 30;   // case wall around the key well
  var NS = 'http://www.w3.org/2000/svg';

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rgb(h) { h = (h || '#888888').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function shade(h, amt) { var t = amt < 0 ? 0 : 255, p = Math.abs(amt) / 100; return hex(rgb(h).map(function (v) { return v + (t - v) * p; })); }
  function lum(h) { var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function legendOn(bg) { return lum(bg) > 0.3 ? '#202124' : '#efede8'; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- 60% layouts, legends in the KAP Vella style ----------
     key: { w: units, l: legend, c: 'alpha' | 'mod' | 'accent' | 'gap' | 'skip' | 'isoenter' }
     "A" = big alpha, "!\n1" = shifted pair, "⇧ Shift" = icon + word on one line,
     "⌃\nControl" = icon above word (bottom row). Keys wider than 1U get a unit mark. */
  function K(w, l, c) { return { w: w, l: l || '', c: c || 'alpha' }; }
  function alphas(list) { return list.map(function (l) { return K(1, l); }); }
  function layout(lang, row, shift) {
    var fr = lang === 'iso-fr', r = [];
    if (lang === 'iso') {
      r.push([K(1, 'Esc', 'accent')].concat(alphas(['!\n1', '"\n2', '£\n3', '$\n4', '%\n5', '^\n6', '&\n7', '*\n8', '(\n9', ')\n0', '_\n-', '+\n='])).concat([K(2, '⌫ Backspace', 'mod')]));
      r.push([K(1.5, '⇥ Tab', 'mod')].concat(alphas('QWERTYUIOP'.split(''))).concat(alphas(['{\n[', '}\n]'])).concat([K(1.5, '↵ Enter', 'isoenter')]));
      r.push([K(1.75, '⇪ Caps', 'mod')].concat(alphas('ASDFGHJKL'.split(''))).concat(alphas([':\n;', '@\n\'', '~\n#'])).concat([K(1.25, '', 'skip')]));
      r.push([K(1.25, '⇧ Shift', 'mod'), K(1, '|\n\\')].concat(alphas(['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<\n,', '>\n.', '?\n/'])));
    } else if (fr) {
      r.push([K(1, 'Échap', 'accent')].concat(alphas(['1\n&', '2\né', '3\n"', "4\n'", '5\n(', '6\n-', '7\nè', '8\n_', '9\nç', '0\nà', '°\n)', '+\n='])).concat([K(2, '⌫ Retour', 'mod')]));
      r.push([K(1.5, '⇥ Tab', 'mod')].concat(alphas('AZERTYUIOP'.split(''))).concat(alphas(['¨\n^', '£\n$'])).concat([K(1.5, '↵ Entrée', 'isoenter')]));
      r.push([K(1.75, '⇪ Verr. Maj', 'mod')].concat(alphas('QSDFGHJKLM'.split(''))).concat(alphas(['%\nù', 'µ\n*'])).concat([K(1.25, '', 'skip')]));
      r.push([K(1.25, '⇧ Maj', 'mod'), K(1, '>\n<')].concat(alphas(['W', 'X', 'C', 'V', 'B', 'N', '?\n,', '.\n;', '/\n:', '§\n!'])));
    } else {
      r.push([K(1, 'Esc', 'accent')].concat(alphas(['!\n1', '@\n2', '#\n3', '$\n4', '%\n5', '^\n6', '&\n7', '*\n8', '(\n9', ')\n0', '_\n-', '+\n='])).concat([K(2, '⌫ Backspace', 'mod')]));
      r.push([K(1.5, '⇥ Tab', 'mod')].concat(alphas('QWERTYUIOP'.split(''))).concat(alphas(['{\n[', '}\n]'])).concat([K(1.5, '|\n\\', 'mod')]));
      r.push([K(1.75, '⇪ Caps', 'mod')].concat(alphas('ASDFGHJKL'.split(''))).concat(alphas([':\n;', '"\n\''])).concat([K(2.25, '↵ Enter', 'accent')]));
      r.push([K(2.25, '⇧ Shift', 'mod')].concat(alphas('ZXCVBNM'.split(''))).concat(alphas(['<\n,', '>\n.', '?\n/'])));
    }
    var sh = fr ? '⇧ Maj' : '⇧ Shift';
    r[3] = r[3].concat(shift === 'split' ? [K(1.75, sh, 'mod'), K(1, '☰\nFunc', 'mod')] : [K(2.75, sh, 'mod')]);
    var ctrl = fr ? '⌃\nCtrl' : '⌃\nControl', sup = '◇\nSuper', alt = '⌥\nAlt', alt2 = fr ? '⌥\nAlt Gr' : '⌥\nAlt';
    r.push(row === '7'
      ? [K(1.5, ctrl, 'mod'), K(1, sup, 'mod'), K(1.5, alt, 'mod'), K(7, '', 'mod'), K(1.5, alt2, 'mod'), K(1, sup, 'mod'), K(1.5, ctrl, 'mod')]
      : [K(1.25, ctrl, 'mod'), K(1.25, sup, 'mod'), K(1.25, alt, 'mod'), K(6.25, '', 'mod'), K(1.25, alt2, 'mod'), K(1.25, sup, 'mod'), K(1.25, '☰\nFunc', 'mod'), K(1.25, ctrl, 'mod')]);
    return r;
  }

  /* Legend styles. Layouts are written with KAP Vella legends; GMK/SWG previews swap them for their own. */
  var RU = { Q: 'Й', W: 'Ц', E: 'У', R: 'К', T: 'Е', Y: 'Н', U: 'Г', I: 'Ш', O: 'Щ', P: 'З', A: 'Ф', S: 'Ы', D: 'В', F: 'А', G: 'П', H: 'Р', J: 'О', K: 'Л', L: 'Д', Z: 'Я', X: 'Ч', C: 'С', V: 'М', B: 'И', N: 'Т', M: 'Ь',
    '{\n[': 'Х', '}\n]': 'Ъ', ':\n;': 'Ж', '"\n\'': 'Э', '<\n,': 'Б', '>\n.': 'Ю', '?\n/': ',\n.', '@\n2': '"\n2', '#\n3': '№\n3', '$\n4': ';\n4', '^\n6': ':\n6', '&\n7': '?\n7' };
  var KANA = { Q: 'た', W: 'て', E: 'い', R: 'す', T: 'か', Y: 'ん', U: 'な', I: 'に', O: 'ら', P: 'せ', A: 'ち', S: 'と', D: 'し', F: 'は', G: 'き', H: 'く', J: 'ま', K: 'の', L: 'り', Z: 'つ', X: 'さ', C: 'そ', V: 'ひ', B: 'こ', N: 'み', M: 'も',
    '!\n1': 'ぬ', '@\n2': 'ふ', '#\n3': 'あ', '$\n4': 'う', '%\n5': 'え', '^\n6': 'お', '&\n7': 'や', '*\n8': 'ゆ', '(\n9': 'よ', ')\n0': 'わ', '_\n-': 'ほ', '+\n=': 'へ', '{\n[': '゛', '}\n]': '゜', ':\n;': 'れ', '"\n\'': 'け', '<\n,': 'ね', '>\n.': 'る', '?\n/': 'め' };
  /* Modifier legends for GMK/SWG previews, the way Cherry-profile sets print them.
     icon: bksp | tab | caps | enter | shift; text: word(s); at: 'top' (top-left), 'mid' (vertically centred), 'tab3' (Tab between arrows) */
  var KEYID = { 'Esc': 'esc', 'Échap': 'esc', '⌫ Backspace': 'bksp', '⌫ Retour': 'bksp', '⇥ Tab': 'tab', '⇪ Caps': 'caps', '⇪ Verr. Maj': 'caps', '↵ Enter': 'enter', '↵ Entrée': 'enter',
    '⇧ Shift': 'shift', '⇧ Maj': 'shift', '⌃\nControl': 'ctrl', '⌃\nCtrl': 'ctrl', '◇\nSuper': 'super', '⌥\nAlt': 'alt', '⌥\nAlt Gr': 'alt', '☰\nFunc': 'fn', '|\n\\': null };
  var SPEC = {
    'gmk-text': { esc: { text: 'Esc', at: 'top' }, bksp: { icon: 'bksp', text: 'Backspace' }, tab: { icon: 'tab', text: 'Tab', at: 'tab3' }, caps: { text: 'Caps\nLock', at: 'top' },
      enter: { icon: 'enter', text: 'Enter' }, shift: { icon: 'shift', text: 'Shift' }, ctrl: { text: 'Control' }, super: { text: 'Super' }, alt: { text: 'Alt' }, fn: { text: 'Fn' } },
    'gmk-icon': { esc: { text: 'Esc', at: 'top' }, bksp: { icon: 'bksp', big: true }, tab: { icon: 'tab' }, caps: { icon: 'caps' }, enter: { icon: 'enter', big: true }, shift: { icon: 'shift' },
      ctrl: { text: 'Control' }, super: { text: 'Code' }, alt: { text: 'Alt' }, fn: { text: 'Fn' } },
    'gmk-plain': { esc: { text: 'Esc', at: 'top' }, bksp: { text: 'Backspace' }, tab: { text: 'Tab' }, caps: { text: 'Caps' }, enter: { text: 'Enter' }, shift: { text: 'Shift' },
      ctrl: { text: 'Control' }, super: { text: 'Super' }, alt: { text: 'Alt' }, fn: { text: 'Fn' } },
    'cyrillic': { esc: { text: 'Сбр', at: 'top' }, bksp: { icon: 'bksp', text: 'Возврат' }, tab: { icon: 'tab', text: 'Таб', at: 'tab3' }, caps: { text: 'Прописн' },
      enter: { icon: 'enter', text: 'Ввод' }, shift: { icon: 'shift', text: 'Регистр' }, ctrl: { text: 'Управл' }, super: { text: 'Сист' }, alt: { text: 'Альт' }, fn: { text: 'Слой' } }
  };
  SPEC.kana = SPEC['gmk-plain'];
  function restyle(rows, style, lang, sub, own, alien) {
    if (!style || style === 'vella') return rows;
    var spec = SPEC[style] || SPEC['gmk-text'], ru = style === 'cyrillic' && lang !== 'iso-fr', kana = style === 'kana' && lang !== 'iso-fr';
    return rows.map(function (row) {
      return row.map(function (k) {
        var n = Object.assign({}, k, { gmk: true });
        if (k.c === 'alpha') { if (alien && /^[A-Z]$/.test(k.l)) n.alien = true; if (ru && RU[k.l]) n.l = RU[k.l]; if (kana && KANA[k.l]) n.sub = KANA[k.l]; if (sub === 'cyrillic' && lang !== 'iso-fr' && RU[k.l] && RU[k.l].length === 1) n.sub = RU[k.l]; if (sub && typeof sub === 'object' && sub[k.l]) n.sub = sub[k.l]; }
        else { var id = KEYID[k.l]; if (id && spec[id]) n.spec = Object.assign({}, spec[id], (own || {})[id] || {}); }
        return n;
      });
    });
  }

  var LANG = { 'ansi': 'ANSI', 'iso-fr': 'ISO FR' };
  var ROW = { '625': '6.25U', '7': '7U' };
  var SHIFT = { 'split': 'Split', 'full': 'Full' };
  var LONG = { 'ansi': 'ANSI (US)', 'iso': 'ISO', 'iso-fr': 'ISO FR (AZERTY)', '625': '6.25U spacebar', '7': '7U spacebar', 'split': 'Split right shift (1.75U + 1U)', 'full': 'Full right shift (2.75U)' };
  var TYPE = { linear: 'Linear', tactile: 'Tactile', clicky: 'Clicky', silent: 'Silent linear', 'silent-tactile': 'Silent tactile' };

  /* ---------- configurator ---------- */
  function Configurator(root, cfg) {
    this.root = root;
    this.cfg = cfg;
    this.uid = Math.random().toString(36).slice(2, 7);
    this.money = new Intl.NumberFormat(cfg.locale || 'en', { style: 'currency', currency: cfg.currency || 'EUR' });
    var blocks = cfg.blocks || [], kitVariants = (cfg.kit && cfg.kit.variants) || [];
    this.cases = blocks.filter(function (b) { return b.type === 'case_color'; }).map(function (b) {
      var v = kitVariants.filter(function (v) { return v.options.some(function (o) { return slug(o) === slug(b.name); }); })[0];
      if (!v && kitVariants.length === 1) v = kitVariants[0];
      var any = kitVariants.filter(function (v) { return v.options.some(function (o) { return slug(o) === slug(b.name); }); });
      return { key: slug(b.name), name: b.name, hex: b.hex, translucent: b.translucent !== false, img: b.img || {}, variant: v || null, soldOut: any.length > 0 && !any.some(function (v) { return v.available; }) };
    });
    this.switches = blocks.filter(function (b) { return b.type === 'switch'; }).map(function (b) {
      return { key: slug(b.name || b.title), name: b.name || b.title, type: b.switch_type || 'linear', housing: b.housing || '#2b2c30', stem: b.stem || '#d9c36a', premade: !!b.premade, variant: b.variant || null, note: b.note || '' };
    });
    this.keycaps = blocks.filter(function (b) { return b.type === 'keycap'; }).map(function (b) {
      return { key: b.custom ? 'custom' : slug(b.name), name: b.name, custom: !!b.custom, alpha: b.alpha, mod: b.mod || b.alpha, accent: b.accent || b.alpha, legend: b.legend || null, variants: b.variants || [], img: b.img || {} };
    });
    this.frames = blocks.filter(function (b) { return b.type === 'frame'; }).map(function (b) { return { key: slug(b.name), name: b.name, hex: b.hex }; });
    this.missing = {};
    this.kitVariants = kitVariants;
    this.premade = this.switches.filter(function (s) { return s.premade; });
    this.selection = this.switches.filter(function (s) { return !s.premade; });
    var avail = function (list) { return (list.filter(function (o) { return !o.variant || o.variant.available !== false; })[0] || list[0] || {}).key; };
    this.state = {
      kase: null, frame: this.frames.length ? null : 'none', sw: null, swMode: 'premade',
      kc: null,
      lang: 'ansi', row: '625', shift: 'split', view: 'front', notes: '', qty: 1, preview: null
    };
    this.presetList = this.presets().map(function (p) { return Object.assign({ key: p.id }, p); });
    this.readUrl();
    this.build();
    this.update();
  }
  var P = Configurator.prototype;

  // colour [cap, legend] of one key in a famous-set preview: per-key samples (GMK) or roles (SWG)
  P.presetColor = function (pre, key, ri, cx) {
    if (pre.keys) {
      var keys = pre.altKeys && this.altOn(pre) ? pre.altKeys : pre.keys;
      var row = keys[Math.min(ri, keys.length - 1)], best = row[0], bd = 1e9, x = 0;
      var widths = [[1,1,1,1,1,1,1,1,1,1,1,1,1,2], [1.5,1,1,1,1,1,1,1,1,1,1,1,1,1.5], [1.75,1,1,1,1,1,1,1,1,1,1,1,2.25], [2.25,1,1,1,1,1,1,1,1,1,1,1.75,1], pre.w4 || [1.5,1,1.5,7,1.5,1,1.5]][Math.min(ri, 4)];
      widths.forEach(function (w, i) { var c = x + w / 2, dd = Math.abs(c - cx) + (Math.abs(w - key.w) < 0.3 ? 0 : 0.35); if (dd < bd && row[i]) { bd = dd; best = row[i]; } x += w; });
      if (key.c === 'isoenter') best = keys[2][keys[2].length - 1];
      return best;
    }
    var r = pre.roles, label = String(key.l);
    if (key.w >= 6) return r.space;
    if (/^(Esc|Échap)$/.test(label)) return r.esc;
    if (key.c === 'isoenter' || /Enter|Entrée/.test(label)) return r.enter;
    return key.c === 'alpha' ? r.alpha : r.mod;
  };
  P.altOn = function (pre) { var a = this.state.altMods; return a == null ? !!pre.altDefault : a; };
  P.presets = function () { return (this.cfg.showPresets === false ? [] : (window.PangeaPresets || [])); };

  P.find = function (list, key) { return list.filter(function (o) { return o.key === key; })[0]; };
  P.keycapVariant = function (kc) {
    if (!kc.variants.length) return null;
    var want = this.state.lang === 'iso-fr' ? /iso|fr|azerty/i : /ansi|us/i;
    return kc.variants.filter(function (v) { return want.test(v.title); })[0] || kc.variants[0];
  };
  P.current = function () {
    var s = this.state, kc = this.find(this.keycaps, s.kc);
    var kase = this.find(this.cases, s.kase), frame = this.find(this.frames, s.frame);
    return { kase: kase, frame: frame, kit: this.kitVariant(kase, frame), sw: this.find(this.switches, s.sw), kc: kc, kcVariant: kc ? this.keycapVariant(kc) : null };
  };
  // kit variants are Body x Frame (e.g. "Teal / Silver Anodized"); falls back to body only
  P.kitVariant = function (kase, frame) {
    if (!kase) return null;
    var has = function (v, name) { return v.options.some(function (o) { return slug(o) === slug(name); }); };
    var list = this.kitVariants.filter(function (v) { return has(v, kase.name); });
    if (frame) list = list.filter(function (v) { return has(v, frame.name); }).concat(list.filter(function (v) { return !has(v, frame.name) && v.options.length === 1; }));
    return list[0] || kase.variant || null;
  };
  P.step = function () { // 0 = pick body, 1 = pick frame, 2 = everything open
    var s = this.state;
    return !s.kase ? 0 : (!s.frame ? 1 : 2);
  };
  P.price = function (v) { return v ? this.money.format(v.price / 100) : ''; };

  /* ----- URL ----- */
  P.readUrl = function () {
    if (!this.cfg.syncUrl) return;
    var p = new URLSearchParams(location.search), s = this.state, sw;
    if (this.find(this.cases, p.get('body'))) s.kase = p.get('body');
    if (s.kase && this.find(this.frames, p.get('frame'))) s.frame = p.get('frame');
    if ((sw = this.find(this.switches, p.get('switch')))) { s.sw = sw.key; s.swMode = sw.premade ? 'premade' : 'custom'; }
    if (this.find(this.keycaps, p.get('keycaps'))) s.kc = p.get('keycaps');
    if (LANG[p.get('layout')]) s.lang = p.get('layout');
    if (ROW[p.get('row')]) s.row = p.get('row');
    if (SHIFT[p.get('shift')]) s.shift = p.get('shift');
  };
  P.shareUrl = function () {
    var s = this.state, base = this.cfg.shareBase || (location.origin + location.pathname);
    return base + '?' + new URLSearchParams({ body: s.kase || '', frame: s.frame || '', 'switch': s.sw || '', keycaps: s.kc, layout: s.lang, row: s.row, shift: s.shift }).toString();
  };
  P.writeUrl = function () {
    if (!this.cfg.syncUrl) return;
    try { history.replaceState(null, '', this.shareUrl()); } catch (e) { /* sandboxed */ }
  };

  /* ----- markup ----- */
  P.opt = function (group, value, checked, disabled, inner, extra) {
    var id = 'pc-' + this.uid + '-' + group + '-' + value;
    return '<input class="pc-sr" type="radio" name="pc-' + this.uid + '-' + group + '" id="' + id + '" value="' + esc(value) + '" data-group="' + group + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '>' +
      '<label for="' + id + '" class="pc-opt' + (extra ? ' ' + extra : '') + '">' + inner + '</label>';
  };
  P.group = function (title, key, body, cls, step) {
    return '<fieldset class="pc-group' + (cls ? ' ' + cls : '') + '" data-step="' + (step == null ? 2 : step) + '"><legend>' + esc(title) + (key ? '<span class="pc-chosen" data-chosen="' + key + '"></span>' : '') + '</legend>' + body + '</fieldset>';
  };

  P.build = function () {
    var self = this, s = this.state, c = this.cfg;
    var out = function (v) { return v && v.available === false; };
    var swInner = function (o) {
      return '<span class="pc-opt-name">' + esc(o.name) + '</span><span class="pc-opt-meta">' + esc(TYPE[o.type] || o.type) + (o.note ? ' · ' + esc(o.note) : '') + '</span>' +
        '<span class="pc-opt-price">' + (out(o.variant) ? 'Sold out' : self.price(o.variant)) + '</span>';
    };
    var cases = this.cases.map(function (o) { return self.opt('case', o.key, o.key === s.kase, o.soldOut, esc(o.name)); }).join('');
    var frames = this.frames.map(function (o) { return self.opt('frame', o.key, o.key === s.frame, false, esc(o.name)); }).join('');
    var premade = this.premade.map(function (o) { return self.opt('sw', o.key, s.swMode === 'premade' && o.key === s.sw, out(o.variant), swInner(o), 'pc-opt--row'); }).join('') +
      (this.selection.length ? this.opt('sw', '__custom', s.swMode === 'custom', false, '<span class="pc-opt-name">Custom</span><span class="pc-opt-meta">Pick from ' + this.selection.length + ' more switches</span><span class="pc-opt-price" aria-hidden="true">+</span>', 'pc-opt--row') : '');
    var selection = this.selection.map(function (o) { return self.opt('swc', o.key, s.swMode === 'custom' && o.key === s.sw, out(o.variant), swInner(o), 'pc-opt--row'); }).join('');
    var kcs = this.keycaps.map(function (o) { return self.opt('kc', o.key, o.key === s.kc, false, esc(o.name)); }).join('');
    var seg = function (group, map, val) { return '<div class="pc-opts">' + (map === ROW ? ['625', '7'] : Object.keys(map)).map(function (k) { return self.opt(group, k, k === val, false, esc(map[k])); }).join('') + '</div>'; };

    this.root.innerHTML =
      '<div class="pc">' +
        '<form class="pc-panel" novalidate>' +
          '<h1 class="pc-title">' + esc(c.title || 'Pangea Mini IM') + '</h1>' +
          '<p class="pc-from" data-total-top></p>' +
          '<p class="pc-next" data-next></p>' +
          this.group('Body', 'case', '<div class="pc-opts">' + cases + '</div>', '', 0) +
          (this.frames.length ? this.group('Frame and Weight', 'frame', '<div class="pc-opts">' + frames + '</div>', '', 1) : '') +
          this.group('Switches', 'sw', '<div class="pc-list">' + premade + '</div><div class="pc-list pc-more" data-selection hidden>' + selection + '</div>' + (c.switchNote ? '<p class="pc-note">' + esc(c.switchNote) + '</p>' : '')) +
          this.group('Keycaps', 'kc', '<div class="pc-opts">' + kcs + '</div>' +
            '<div class="pc-custom" data-custom-kc hidden><label for="pc-notes-' + this.uid + '">Which set?</label>' +
            '<textarea id="pc-notes-' + this.uid + '" rows="2" data-notes placeholder="Name, kits, or a link"></textarea>' +
            '<p class="pc-note">Custom sets are shown blank. We confirm fit by email before building.</p></div>' +
            (this.presetList.length ? '<div class="pc-famous"><button type="button" class="pc-famous-toggle" data-famous aria-expanded="false">Preview with famous sets</button>' +
              '<div class="pc-famous-panel" data-famous-panel hidden><p class="pc-note">Preview only, to imagine the board with other sets. These are not part of your order.</p>' +
              ['GMK', 'SWG'].map(function (brand) {
                var list = self.presetList.filter(function (p) { return p.brand === brand; });
                return list.length ? '<p class="pc-famous-brand">' + brand + '</p><div class="pc-opts pc-opts--small">' + list.map(function (p) { return self.opt('pre', p.key, false, false, esc(p.name.replace(/^(GMK|SWG) /, ''))); }).join('') + '</div>' : '';
              }).join('') +
              '<button type="button" class="pc-share" data-clear-preview>Back to my keycaps</button></div></div>' : '')) +
          this.group('Layout', null, seg('lang', LANG, s.lang)) +
          this.group('Bottom Row', null, seg('row', ROW, s.row)) +
          this.group('Right Shift', null, seg('shift', SHIFT, s.shift)) +
        '</form>' +
        '<div class="pc-stage">' +
          '<div class="pc-canvas" data-canvas role="img" aria-label="Preview of your build"></div>' +
          '<div class="pc-stage-foot">' +
            '<div class="pc-views">' +
              ['front', 'back'].map(function (v) { return '<button type="button" class="pc-view" data-view="' + v + '" aria-pressed="false">' + v.charAt(0).toUpperCase() + v.slice(1) + '</button>'; }).join('') +
            '</div>' +
            '<div class="pc-modtoggle" data-modtoggle hidden><button type="button" data-mods="base" aria-pressed="false">Base mods</button><button type="button" data-mods="alt" aria-pressed="false">Alt mods</button></div>' +
            '<p class="pc-caption" data-caption></p>' +
          '</div>' +
          '<div class="pc-summary" aria-live="polite">' +
            '<ul class="pc-lines" data-lines></ul>' +
            '<div class="pc-total"><span>Total</span><span data-total></span></div>' +
            '<div class="pc-buy">' +
              '<div class="pc-qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><input type="number" min="1" value="1" data-qty-input aria-label="Quantity" inputmode="numeric"><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>' +
              '<button type="button" class="pc-add" data-add>Add to cart</button>' +
            '</div>' +
            '<p class="pc-error" data-error hidden></p>' +
            '<button type="button" class="pc-share" data-share>Copy build link</button>' +
          '</div>' +

        '</div>' +
      '</div>';
    this.bind();
  };

  /* ----- events ----- */
  P.bind = function () {
    var self = this, r = this.root, s = this.state;
    r.addEventListener('change', function (e) {
      var t = e.target, g = t.dataset && t.dataset.group;
      if (!g) return;
      if (g === 'case') s.kase = t.value;
      if (g === 'frame') s.frame = t.value;
      if (g === 'sw') {
        if (t.value === '__custom') { s.swMode = 'custom'; var p = $('input[data-group="swc"]:checked', r); s.sw = p ? p.value : null; }
        else { s.swMode = 'premade'; s.sw = t.value; $$('input[data-group="swc"]', r).forEach(function (i) { i.checked = false; }); }
      }
      if (g === 'swc') { s.swMode = 'custom'; s.sw = t.value; var cu = $('input[data-group="sw"][value="__custom"]', r); if (cu) cu.checked = true; }
      if (g === 'kc') { s.kc = t.value; s.preview = null; $$('input[data-group="pre"]', r).forEach(function (i) { i.checked = false; }); }
      if (g === 'pre') { s.preview = t.value; s.altMods = null; $$('input[data-group="kc"]', r).forEach(function (i) { i.checked = false; }); }
      if (g === 'lang') s.lang = t.value;
      if (g === 'row') s.row = t.value;
      if (g === 'shift') s.shift = t.value;
      if (/^(sw|swc|kc|pre)$/.test(g)) s.view = 'front'; // switches and keycaps only show from the front
      self.update();
    });
    r.addEventListener('input', function (e) {
      if (e.target.matches('[data-notes]')) s.notes = e.target.value;
      if (e.target.matches('[data-qty-input]')) { s.qty = Math.max(1, parseInt(e.target.value, 10) || 1); self.renderSummary(); }
    });
    r.addEventListener('click', function (e) {
      var v = e.target.closest('[data-view]');
      if (v) { s.view = v.dataset.view; self.update(); return; }
      var q = e.target.closest('[data-qty]');
      if (q) { s.qty = Math.max(1, s.qty + Number(q.dataset.qty)); $('[data-qty-input]', r).value = s.qty; self.renderSummary(); return; }
      if (e.target.closest('[data-add]')) { self.addToCart(); return; }
      if (e.target.closest('[data-share]')) self.copyLink(e.target.closest('[data-share]'));
      var mb = e.target.closest('[data-mods]');
      if (mb) { s.altMods = mb.dataset.mods === 'alt'; self.update(); return; }
      var ft = e.target.closest('[data-famous]');
      if (ft) { var pn = $('[data-famous-panel]', r), open = pn.hidden; pn.hidden = !open; ft.setAttribute('aria-expanded', open); return; }
      if (e.target.closest('[data-clear-preview]')) { s.preview = null; $$('input[data-group="pre"]', r).forEach(function (i) { i.checked = false; }); $$('input[data-group="kc"]', r).forEach(function (i) { i.checked = i.value === s.kc; }); self.update(); }
    });
    $('form', r).addEventListener('submit', function (e) { e.preventDefault(); self.addToCart(); });
  };

  P.copyLink = function (btn) {
    var url = this.shareUrl(), old = btn.textContent;
    var done = function (ok) { btn.textContent = ok ? 'Link copied' : url; setTimeout(function () { btn.textContent = old; }, ok ? 1600 : 6000); };
    try { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); } catch (err) { done(false); }
  };

  P.update = function () {
    var s = this.state, r = this.root, cur = this.current();
    $('[data-selection]', r).hidden = s.swMode !== 'custom';
    $('[data-custom-kc]', r).hidden = !(cur.kc && cur.kc.custom);
    $$('[data-view]', r).forEach(function (b) { var on = b.dataset.view === s.view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    var step = this.step();
    $$('fieldset[data-step]', r).forEach(function (f) { var locked = Number(f.dataset.step) > step; f.disabled = locked; f.classList.toggle('is-locked', locked); });
    $('[data-next]', r).textContent = step === 0 ? 'Start with the body.' : step === 1 ? 'Now pick the frame and weight.' : !cur.sw ? 'Next, the switches.' : !cur.kc ? 'Last, the keycaps.' : '';
    $('[data-chosen="case"]', r).textContent = cur.kase ? cur.kase.name : '';
    if ($('[data-chosen="frame"]', r)) $('[data-chosen="frame"]', r).textContent = cur.frame ? cur.frame.name : '';
    $('[data-chosen="sw"]', r).textContent = cur.sw ? cur.sw.name : '';
    $('[data-chosen="kc"]', r).textContent = cur.kc ? cur.kc.name : '';
    this.renderStage();
    this.renderSummary();
    this.writeUrl();
  };

  /* ----- preview ----- */
  P.renderStage = function () {
    var photo, s = this.state, cur = this.current(), box = $('[data-canvas]', this.root), cap = $('[data-caption]', this.root);
    box.innerHTML = '';
    if (!cur.kase) cur = Object.assign({}, cur, { kase: { name: '', hex: '#fbfbfa', translucent: false, img: {}, ghost: true }, ghost: true });
    var layers = !cur.ghost && this.renderLayers(cur);
    if (layers) { this.showLayers(box, layers); }
    else if ((photo = s.view === 'back' ? cur.kase.img.back : cur.kase.img.front)) {
      var wrap = document.createElement('div'); wrap.className = 'pc-layers';
      var add = function (src) { if (!src) return; var i = document.createElement('img'); i.src = src; i.alt = ''; i.decoding = 'async'; wrap.appendChild(i); };
      add(photo);
      if (s.view === 'front' && cur.kc) add(cur.kc.custom ? this.cfg.customKeycapImage : (cur.kc.img[s.lang === 'iso-fr' ? 'front_iso' : 'front_ansi'] || cur.kc.img.front));
      box.appendChild(wrap);
    } else {
      this.nextSeen = {};
      box.appendChild(s.view === 'back' ? this.drawBack(cur) : this.drawFront(cur));
      if (s.view === 'front') this.seen = this.nextSeen;
    }
    var mt = $('[data-modtoggle]', this.root), pv = !cur.ghost && s.view === 'front' && s.preview ? this.find(this.presetList, s.preview) : null, self = this;
    mt.hidden = !(pv && pv.altKeys);
    if (pv && pv.altKeys) $$('[data-mods]', mt).forEach(function (b) { var on = (b.dataset.mods === 'alt') === self.altOn(pv); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    if (cur.ghost) { cap.textContent = 'Pick a body to start'; return; }
    var txt = s.view === 'back' ? cur.kase.name + ' body, ' + (cur.frame ? cur.frame.name.toLowerCase() : 'frame not picked') + ' weight'
      : !cur.frame ? cur.kase.name + ' body / pick a frame'
      : !cur.sw ? cur.kase.name + ' / ' + cur.frame.name + ' / pick switches'
      : s.preview && this.find(this.presetList, s.preview) ? 'Preview: ' + this.find(this.presetList, s.preview).name + (this.find(this.presetList, s.preview).altKeys ? (this.altOn(this.find(this.presetList, s.preview)) ? ', alt mods' : ', base mods') : '') + ' (not included) / ' + (s.lang === 'iso-fr' ? 'ISO' : 'ANSI')
      : !cur.kc ? cur.sw.name + ' installed / pick keycaps'
      : [LONG[s.lang], LONG[s.row], LONG[s.shift]].join(' / ') + (cur.kc.custom ? ' / custom keycaps shown blank' : '');
    cap.textContent = txt;
  };

  /* Pre-rendered layers, the way the Constance configurator works: transparent PNG/WebP files of one size,
     stacked, named by option. Any missing file is remembered and that layer falls back (case -> drawing). */
  P.renderLayers = function (cur) {
    var r = this.cfg.renders, s = this.state;
    if (!r || !r.base || !cur.frame) return null;
    var name = function (n) { return r.base + n + (r.ext || '.png'); };
    var lay = s.lang + '-' + s.row + '-' + s.shift;
    var list = [{ key: 'case', src: name('case-' + s.view + '-' + cur.kase.key + '-' + cur.frame.key) }];
    if (s.view === 'front') {
      if (cur.kc) list.push({ key: 'caps', src: cur.kc.custom ? this.cfg.customKeycapImage : name('keycaps-' + lay + '-' + cur.kc.key) });
      else if (cur.sw) list.push({ key: 'switches', src: name('switches-' + lay + '-' + cur.sw.key) });
    }
    this.missing = this.missing || {};
    if (this.missing[list[0].src]) return null; // no case render for this combination: draw it instead
    return list.filter(function (l) { return l.src; });
  };
  P.showLayers = function (box, list) {
    var self = this, wrap = document.createElement('div');
    wrap.className = 'pc-layers';
    list.forEach(function (l) {
      var img = document.createElement('img');
      img.alt = ''; img.decoding = 'async'; img.dataset.layer = l.key;
      img.onerror = function () { self.missing[l.src] = true; if (l.key === 'case') self.renderStage(); else img.remove(); };
      if (self.shownLayer && self.shownLayer[l.key] !== l.src) img.className = 'pc-pop';
      img.src = l.src;
      wrap.appendChild(img);
    });
    this.shownLayer = {}; list.forEach(function (l) { self.shownLayer[l.key] = l.src; });
    box.appendChild(wrap);
  };

  /* path helpers: rounded polygon corners and smooth curves through points */
  function fmt(p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }
  function toward(p, q, r) { var dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, t = Math.min(r, d / 2) / d; return [p[0] + dx * t, p[1] + dy * t]; }
  // pts: [[x, y, radius], ...] in SVG units; radius 0 keeps the point as is
  function roundPath(pts, closed) {
    var n = pts.length, d = '';
    pts.forEach(function (p, i) {
      var r = p[2] || 0, edge = !closed && (i === 0 || i === n - 1);
      if (!r || edge) { d += (d ? ' L' : 'M') + fmt(p); return; }
      var a = toward(p, pts[(i - 1 + n) % n], r), b = toward(p, pts[(i + 1) % n], r);
      d += (d ? ' L' : 'M') + fmt(a) + ' Q' + fmt(p) + ' ' + fmt(b);
    });
    return d + (closed ? ' Z' : '');
  }
  // Catmull-Rom spline through the points, as cubic curves
  function smoothPath(pts) {
    var d = 'M' + fmt(pts[0]), n = pts.length;
    for (var i = 0; i < n - 1; i++) {
      var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)];
      d += ' C' + fmt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + fmt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + fmt(p2);
    }
    return d;
  }

  // Case traced from the Pangea Mini IM line drawings (top and bottom view).
  // T() maps drawing coordinates (outer case 88..665 x 155..372) onto the SVG.
  P.T = function (x, y) {
    var W = 15 * U + PAD * 2, H = 5 * U + PAD * 2;
    return [(x - 88) * W / 577, (y - 155) * H / 217];
  };
  P.pts = function (list) { var self = this; return list.map(function (q) { var t = self.T(q[0], q[1]); return t[0].toFixed(1) + ',' + t[1].toFixed(1); }); };
  P.look = function (k) { // line colors for the drawing: dark ink on the bare template, tinted on a colored body
    return k.ghost ? { line: '#2b2b2b', soft: '#2b2b2b', lw: 1.3, op: 1 } : { line: shade(k.hex, -48), soft: shade(k.hex, -30), lw: 1.1, op: 0.55 };
  };

  // weight outline in SVG units: notches for the rear feet, sides flaring out, arc from y 268 to 315.
  // inset shrinks it for the inner lip; notched = false gives the plain outline seen from above
  P.weightPath = function (inset, notched) {
    var self = this, i = inset || 0, T = function (x, y, r) { var t = self.T(x, y); return [t[0], t[1], r]; };
    var pts = notched
      ? [T(130 + i, 216 + i, 9), T(160 + i, 216 + i, 6), T(165 + i, 204 + i, 6), T(585 - i, 204 + i, 6), T(590 - i, 216 + i, 6), T(620 - i, 216 + i, 9), T(630 - i, 268, 14)]
      : [T(130, 216, 9), T(620, 216, 9), T(630, 268, 14)];
    var a = this.T(630 - i, 268), c = this.T(375, 362 - i * 2), b = this.T(120 + i, 268);
    for (var k = 1; k < 32; k++) {
      var t = k / 32, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], 0]);
    }
    pts.push([b[0], b[1], 14]);
    return roundPath(pts, true);
  };

  P.drawShell = function (svg, W, H, k, back) {
    var id = this.uid, defs = el('defs', {}, svg), L = this.look(k), self = this;
    var f = el('filter', { id: 'pcblur' + id, x: '-20%', y: '-20%', width: '140%', height: '160%' }, defs);
    el('feGaussianBlur', { stdDeviation: 14 }, f);
    var g = el('linearGradient', { id: 'pcsheen' + id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': 0.32 }, g);
    el('stop', { offset: '0.45', 'stop-color': '#ffffff', 'stop-opacity': 0.04 }, g);
    el('stop', { offset: '1', 'stop-color': '#000000', 'stop-opacity': 0.12 }, g);
    if (!k.ghost) el('ellipse', { cx: W / 2, cy: H + 16, rx: W * 0.48, ry: 18, fill: '#000', opacity: 0.26, filter: 'url(#pcblur' + id + ')' }, svg);
    var a = k.ghost ? 1 : k.translucent ? (lum(k.hex) < 0.05 ? 0.84 : 0.72) : 1;
    var fill = k.ghost ? '#fbfbfa' : k.hex;
    el('rect', { x: 0, y: 0, width: W, height: H, rx: 15, fill: fill, 'fill-opacity': a, stroke: L.line, 'stroke-width': L.lw * 1.4, 'stroke-opacity': k.ghost ? 1 : 0.7 }, svg);
    if (!k.ghost) el('rect', { x: 0, y: 0, width: W, height: H, rx: 15, fill: 'url(#pcsheen' + id + ')' }, svg);
    // rim: the second outline that runs just inside the edge
    var r0 = this.T(98, 163), r1 = this.T(655, 364);
    el('rect', { x: r0[0], y: r0[1], width: r1[0] - r0[0], height: r1[1] - r0[1], rx: 11, fill: 'none', stroke: L.line, 'stroke-width': L.lw, 'stroke-opacity': L.op }, svg);
    var line = function (list) { el('polyline', { points: self.pts(list).join(' '), fill: 'none', stroke: L.line, 'stroke-width': L.lw, 'stroke-opacity': L.op, 'stroke-linejoin': 'round' }, svg); };
    if (back) {
      // bottom view: big chamfers on the rear corners, curved side facets, inner rear edge
      // measured from the drawing: rear chamfers into the inner rear edge, then per side an outer and an inner
      // facet that run down at a steady slope and curve into the edge, plus a short horizontal seam
      var stroke = { fill: 'none', stroke: L.line, 'stroke-width': L.lw, 'stroke-opacity': L.op, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      var P = function (x, y, m) { var t = self.T(m ? 749 - x : x, y); return t[0].toFixed(1) + ',' + t[1].toFixed(1); };
      var rear = [[96, 165], [124, 186, 6], [625, 186, 6], [653, 165]].map(function (q) { var t = self.T(q[0], q[1]); return [t[0], t[1], q[2] || 0]; });
      el('path', Object.assign({ d: roundPath(rear, false) }, stroke), svg);
      [false, true].forEach(function (m) {
        el('path', Object.assign({ d: 'M' + P(96, 166, m) + ' Q' + P(112, 186, m) + ' ' + P(113.5, 199, m) + ' L' + P(100.5, 278, m) + ' Q' + P(98, 290, m) + ' ' + P(93, 296, m) }, stroke), svg);
        el('path', Object.assign({ d: 'M' + P(124, 186, m) + ' L' + P(124.3, 192, m) + ' L' + P(110.5, 280, m) + ' C' + P(107.5, 293, m) + ' ' + P(101, 302, m) + ' ' + P(93, 305, m) }, stroke), svg);
        el('path', Object.assign({ d: 'M' + P(93, 269.5, m) + ' L' + P(112.7, 269.5, m) }, stroke), svg);
      });
    } else {
      // top view: corner facets from the rim into the opening of the WK top frame
      var o0 = [PAD - 13, PAD - 13], o1 = [W - PAD + 13, H - PAD + 13];
      [[r0[0], r0[1], o0[0], o0[1]], [r1[0], r0[1], o1[0], o0[1]], [r0[0], r1[1], o0[0], o1[1]], [r1[0], r1[1], o1[0], o1[1]]].forEach(function (q) {
        el('line', { x1: q[0], y1: q[1], x2: q[2], y2: q[3], stroke: L.line, 'stroke-width': L.lw, 'stroke-opacity': L.op }, svg);
      });
    }
  };

  // inside of the empty case seen from above: ribs, screws, center hole, daughterboard, weight
  P.drawInside = function (svg, k) {
    var L = this.look(k), self = this;
    var cid = 'pcwell' + this.uid, defs = $('defs', svg);
    var cp = el('clipPath', { id: cid }, defs);
    el('rect', { x: PAD - 3, y: PAD - 3, width: 15 * U + 6, height: 5 * U + 6 }, cp);
    var g = el('g', { 'clip-path': 'url(#' + cid + ')' }, svg);
    el('rect', { x: PAD - 3, y: PAD - 3, width: 15 * U + 6, height: 5 * U + 6, fill: k.ghost ? '#ffffff' : shade(k.hex, -18), 'fill-opacity': k.ghost ? 1 : 0.55 }, g);
    var st = { fill: 'none', stroke: L.line, 'stroke-width': L.lw, 'stroke-opacity': L.op };
    var P2 = function (list, close, extra) { return el('path', Object.assign({ d: 'M' + self.pts(list).join(' L') + (close ? ' Z' : '') }, st, extra || {}), g); };
    // weight seen through the floor
    el('path', Object.assign({ d: this.weightPath(0, false) }, st, { fill: k.ghost ? 'none' : '#c4c6c9', 'fill-opacity': 0.35 }), g);
    // ribs
    [150, 295, 455, 600].forEach(function (x) { P2([[x, 180], [x, 335]]); });
    P2([[112, 213], [640, 213]]);
    // screws and the center hole
    [[160, 242], [303, 242], [447, 242], [590, 242]].forEach(function (q) {
      var t = self.T(q[0], q[1]); el('circle', Object.assign({ cx: t[0], cy: t[1], r: 5 }, st), g); el('circle', { cx: t[0], cy: t[1], r: 1.6, fill: L.line, opacity: L.op }, g);
    });
    var c = this.T(375, 262); el('circle', Object.assign({ cx: c[0], cy: c[1], r: 27 }, st), g);
    // daughterboard + USB-C
    P2([[350, 182], [395, 182], [395, 196], [350, 196]], true);
    P2([[335, 196], [405, 196], [405, 209], [335, 209]], true);
    [[360, 189], [385, 189]].forEach(function (q) { var t = self.T(q[0], q[1]); el('circle', Object.assign({ cx: t[0], cy: t[1], r: 3 }, st), g); });
  };

  P.drawFront = function (cur) {
    var s = this.state, W = 15 * U + PAD * 2, H = 5 * U + PAD * 2, k = cur.kase, self = this;
    var svg = el('svg', { viewBox: '-20 -20 ' + (W + 40) + ' ' + (H + 70), 'class': 'pc-svg' });
    this.drawShell(svg, W, H, k, false);
    // frame ring only once a frame is picked
    if (cur.frame) {
      el('rect', { x: PAD - 13, y: PAD - 13, width: 15 * U + 26, height: 5 * U + 26, rx: 7, fill: cur.frame.hex, 'class': this.fresh('frame') ? 'pc-pop' : null }, svg);
      el('rect', { x: PAD - 13, y: PAD - 13, width: 15 * U + 26, height: 5 * U + 26, rx: 7, fill: 'none', stroke: shade(cur.frame.hex, -22), 'stroke-width': 1 }, svg);
    }
    var pre = !cur.ghost && this.state.preview ? this.find(this.presetList, this.state.preview) : null;
    var showCaps = !cur.ghost && (cur.kc || pre);
    var mode = showCaps ? 'caps' : (!cur.ghost && cur.sw ? 'switches' : (!cur.ghost && cur.frame ? 'cutouts' : 'inside'));
    if (mode === 'inside') { this.drawInside(svg, k); return svg; }
    el('rect', { x: PAD - 3, y: PAD - 3, width: 15 * U + 6, height: 5 * U + 6, rx: 3, fill: mode === 'caps' && !cur.sw ? '#141517' : '#3a3c40', 'class': this.fresh('plate') ? 'pc-pop' : null }, svg);
    var g = el('g', { transform: 'translate(' + PAD + ',' + PAD + ')' }, svg);
    var animate = (mode === 'caps' && this.fresh('caps', pre ? 'p:' + pre.key : this.state.kc)) || (mode === 'switches' && this.fresh('switches', this.state.sw));
    if (mode === 'caps') this.keycapDefs(svg);
    var kc = cur.kc, blank = !pre && kc && kc.custom;
    var col = !kc || blank ? { alpha: '#e2e1dc', mod: '#d6d5cf', accent: '#d6d5cf' } : { alpha: kc.alpha, mod: kc.mod, accent: kc.accent };
    var lang = pre && s.lang === 'iso-fr' ? 'iso' : s.lang;
    var rows = layout(lang, s.row, s.shift);
    // keycaps sit on the installed switches: draw the switches first, the caps land on top of them
    if (mode === 'caps' && cur.sw) {
      var under = el('g', { 'class': 'pc-under' }, g);
      rows.forEach(function (row, ri) {
        var x = 0;
        row.forEach(function (key) {
          var kx = x * U; x += key.w;
          if (key.c === 'skip' || key.c === 'gap') return;
          self.drawCutout(under, key, kx, ri * U, false);
          self.drawSwitch(under, key, kx, ri * U, cur.sw, null);
        });
      });
    }
    if (pre) rows = restyle(rows, pre.legends, lang, pre.subs || pre.sub, pre.mods, pre.alien);
    rows.forEach(function (row, ri) {
      var rg = el('g', { 'class': 'pc-row' }, g);
      var x = 0, y = ri * U;
      row.forEach(function (key) {
        var kx = x * U; x += key.w;
        if (key.c === 'skip' || key.c === 'gap') return;
        var delay = animate ? Math.round((x - key.w / 2) * 42 + ri * 18) : null;
        if (mode === 'caps') {
          var kg = el('g', delay == null ? {} : { 'class': 'pc-sw-in', style: '--d:' + delay }, rg), KL = self.keyLayers(kg), bg, ink;
          if (pre) { var pc = self.presetColor(pre, key, ri, x - key.w / 2); bg = pc[0]; ink = pc[1]; }
          else { bg = col[key.c === 'isoenter' ? 'accent' : key.c] || col.alpha; ink = blank || !kc ? null : kc.legend; }
          self.legendColor = ink; self.subColor = pre && pre.subColor;
          return self.drawKey(KL, key, kx, y, bg, blank);
        }
        if (mode === 'switches') self.drawCutout(rg, key, kx, y, false);
        if (mode === 'switches') return self.drawSwitch(rg, key, kx, y, cur.sw, delay);
        self.drawCutout(rg, key, kx, y, cur.ghost);
      });
    });
    return svg;
  };

  // true the first time a layer shows up, so only newly added layers animate
  P.fresh = function (layer, value) {
    var v = value == null ? true : value;
    (this.nextSeen || (this.nextSeen = {}))[layer] = v;
    return !(this.seen && this.seen[layer] === v);
  };

  P.drawCutout = function (g, k, x, y, ghost) {
    var cx = k.c === 'isoenter' ? x + 0.875 * U : x + k.w * U / 2, cy = k.c === 'isoenter' ? y + U : y + U / 2, sz = 0.52 * U;
    el('rect', { x: cx - sz / 2, y: cy - sz / 2, width: sz, height: sz, rx: 1.5, fill: ghost ? '#b3b3b2' : '#17181a' }, g);
  };

  /* ---------- keycap shading ----------
     Light comes from above and slightly in front. Each wall is a gradient from the top surface (inner edge)
     out to the keycap's foot (outer edge); tones are lightness offsets in HSL, so dark and light sets both read. */
  function hsl(hex) {
    var c = rgb(hex).map(function (v) { return v / 255; }), mx = Math.max.apply(0, c), mn = Math.min.apply(0, c), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === c[0] ? (c[1] - c[2]) / d + (c[1] < c[2] ? 6 : 0) : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4; h /= 6; }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    var f = function (p, q, t) { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    if (!s) return hex([l * 255, l * 255, l * 255]);
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return hex([f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]);
  }
  function tone(hexc, t) { // t: lightness offset, scaled down near black and white so nothing clips
    var c = hsl(hexc), room = t > 0 ? 1 - c[2] : c[2], amt = t * (0.35 + 0.65 * Math.min(1, room * 2.2));
    return fromHsl(c[0], c[1], Math.max(0.02, Math.min(0.97, c[2] + amt)));
  }

  P.keycapDefs = function (svg) {
    var id = this.uid, defs = $('defs', svg);
    this.kcDefs = defs; this.kcGrads = {};
    var soft = el('filter', { id: 'kcsoft' + id, x: '-2%', y: '-2%', width: '104%', height: '104%' }, defs);
    el('feGaussianBlur', { stdDeviation: 0.55 }, soft);
    var sh = el('filter', { id: 'kcshadow' + id, x: '-10%', y: '-10%', width: '120%', height: '130%' }, defs);
    el('feGaussianBlur', { stdDeviation: 2.2 }, sh);
    var lin = function (name, x2, y2, stops) {
      var g = el('linearGradient', { id: name, x1: 0, y1: 0, x2: x2, y2: y2 }, defs);
      stops.forEach(function (st) { el('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] }, g); });
    };
    // top surface: light falls off front-to-back, and the cylindrical dish darkens the left and right edges
    lin('kcfacev' + id, 0, 1, [[0, '#ffffff', 0.09], [0.5, '#ffffff', 0], [1, '#000000', 0.05]]);
    lin('kcfaceh' + id, 1, 0, [[0, '#000000', 0.06], [0.28, '#000000', 0], [0.72, '#000000', 0], [1, '#000000', 0.06]]);
  };
  // one gradient per wall per color, cached
  P.wallGrad = function (bg, side) {
    var key = side + bg, id = this.uid;
    if (this.kcGrads[key]) return this.kcGrads[key];
    var T = {   // [inner tone, outer tone]
      back: [0.07, 0.025], left: [0.0, -0.05], right: [-0.035, -0.09], front: [-0.045, -0.12]
    }[side];
    var dir = { back: [0, 1, 0, 0], left: [1, 0, 0, 0], right: [0, 0, 1, 0], front: [0, 0, 0, 1] }[side];
    var name = 'kcw' + id + '_' + side + '_' + bg.replace('#', '');
    var g = el('linearGradient', { id: name, x1: dir[0], y1: dir[1], x2: dir[2], y2: dir[3] }, this.kcDefs);
    el('stop', { offset: 0, 'stop-color': tone(bg, T[0]) }, g);
    el('stop', { offset: 1, 'stop-color': tone(bg, T[1]) }, g);
    return (this.kcGrads[key] = 'url(#' + name + ')');
  };

  // keycap layers for one row: shadow (blurred), walls (softened seams), tops, legends
  P.keyLayers = function (rowGroup) {
    var id = this.uid;
    return {
      shadow: el('g', { filter: 'url(#kcshadow' + id + ')', opacity: 0.55 }, rowGroup),
      walls: el('g', { filter: 'url(#kcsoft' + id + ')' }, rowGroup),
      tops: el('g', {}, rowGroup),
      ink: el('g', {}, rowGroup)
    };
  };

  // Cherry-profile keycap from above: four walls running into an off-center, dished top surface
  P.drawKey = function (L, k, x, y, bg, blank) {
    var id = this.uid;
    var d = function (pts) { return 'M' + pts.map(function (q) { return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' L') + ' Z'; };
    var face = function (attrs) {
      el(attrs.tag || 'rect', Object.assign({}, attrs.geo, { fill: bg }), L.tops);
      el(attrs.tag || 'rect', Object.assign({}, attrs.geo, { fill: 'url(#kcfaceh' + id + ')' }), L.tops);
      el(attrs.tag || 'rect', Object.assign({}, attrs.geo, { fill: 'url(#kcfacev' + id + ')' }), L.tops);
    };
    if (k.c === 'isoenter') {
      var X1 = x + 1.5 * U, XL = x + 0.25 * U, Y2 = y + 2 * U;
      var outer = d([[x + 1.4, y + 1.4], [X1 - 1.4, y + 1.4], [X1 - 1.4, Y2 - 1.4], [XL + 1.4, Y2 - 1.4], [XL + 1.4, y + U - 1.4], [x + 1.4, y + U - 1.4]]);
      var top = roundPath([[x + 9, y + 2.4, 6], [X1 - 9, y + 2.4, 6], [X1 - 10.2, Y2 - 15.5, 6.5], [XL + 10.2, Y2 - 15.5, 6.5], [XL + 9.5, y + U - 13, 5], [x + 10.2, y + U - 15.5, 6.5]], true);
      el('path', { d: outer, fill: '#000', transform: 'translate(0,2.5)' }, L.shadow);
      el('path', { d: outer, fill: this.wallGrad(bg, 'front'), 'stroke-linejoin': 'round', 'stroke-width': 2.5, stroke: tone(bg, -0.07) }, L.walls);
      face({ tag: 'path', geo: { d: top, 'stroke-linejoin': 'round' } });
      if (!blank) { this.legend(L.ink, k, x + 12.5, y, bg); if (!k.gmk) this.unit(L.ink, '1.50 U', X1 - 13, Y2 - 19.5, bg); }
      return;
    }
    // measured from the Cherry profile drawing: top surface reaches the back edge, ~63% wide, ~72% tall,
    // narrows slightly toward the front, round corners, bottom edge sags with the cylindrical dish
    var w = k.w * U, x0 = x + 1.4, y0 = y + 1.4, x1 = x + w - 1.4, y1 = y + U - 1.4;
    var tl = x + 9, tr = x + w - 9, bl = x + 10.2, br = x + w - 10.2, ty = y + 2.4, by = y + 38.5, sag = Math.min(2.4, 0.9 + k.w * 0.25);
    var rt = 6, rb = 6.5, n = function (v) { return v.toFixed(2); };
    var top = 'M' + n(tl + rt) + ',' + n(ty) + ' L' + n(tr - rt) + ',' + n(ty) + ' Q' + n(tr) + ',' + n(ty) + ' ' + n(tr - 0.2) + ',' + n(ty + rt) +
      ' L' + n(br + 0.2) + ',' + n(by - rb) + ' Q' + n(br) + ',' + n(by) + ' ' + n(br - rb) + ',' + n(by + sag * 0.35) +
      ' Q' + n((bl + br) / 2) + ',' + n(by + sag * 1.6) + ' ' + n(bl + rb) + ',' + n(by + sag * 0.35) +
      ' Q' + n(bl) + ',' + n(by) + ' ' + n(bl - 0.2) + ',' + n(by - rb) + ' L' + n(tl + 0.2) + ',' + n(ty + rt) + ' Q' + n(tl) + ',' + n(ty) + ' ' + n(tl + rt) + ',' + n(ty) + ' Z';
    el('rect', { x: x0, y: y0 + 2.5, width: x1 - x0, height: y1 - y0, rx: 4, fill: '#000' }, L.shadow);
    // foot = front wall; side walls taper out toward the front; a sliver of back wall
    el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 3.5, fill: this.wallGrad(bg, 'front') }, L.walls);
    el('path', { d: d([[x0, y0 + 3], [tl, ty + rt], [bl, by - rb * 0.4], [x0 + 1.2, y1 - 1.2]]), fill: this.wallGrad(bg, 'left') }, L.walls);
    el('path', { d: d([[x1, y0 + 3], [x1 - 1.2, y1 - 1.2], [br, by - rb * 0.4], [tr, ty + rt]]), fill: this.wallGrad(bg, 'right') }, L.walls);
    el('path', { d: d([[x0 + 3, y0], [x1 - 3, y0], [tr - rt * 0.4, ty], [tl + rt * 0.4, ty]]), fill: this.wallGrad(bg, 'back') }, L.walls);
    face({ tag: 'path', geo: { d: top } });
    el('path', { d: top, fill: 'none', stroke: tone(bg, 0.05), 'stroke-width': 0.8, 'stroke-opacity': 0.55 }, L.tops);
    if (blank) return;
    if (k.l) this.legend(L.ink, k, x + 12.5, y, bg);
    if (k.w > 1 && !k.gmk) this.unit(L.ink, k.w.toFixed(2) + ' U', x + w - 13, y + 35.5, bg);
    if (k.sub) el('text', { x: x + w - 11.5, y: y + 34.5, fill: this.subColor || this.ink(bg), 'text-anchor': 'end', 'class': 'pc-lg-sub' }, L.ink).textContent = k.sub;
  };

  P.ink = function (bg) { return this.legendColor || legendOn(bg); };
  P.unit = function (g, text, x, y, bg) {
    el('text', { x: x, y: y, fill: this.ink(bg), 'text-anchor': 'end', 'class': 'pc-unit' }, g).textContent = text;
  };
  // Original "alien" glyphs for alien-alpha previews: an angular stroke on a 3x3 grid plus a dot, picked per letter
  P.alienGlyph = function (g, ch, x, y, fill) {
    var n = ch.charCodeAt(0) * 2654435761 >>> 0, pts = [], used = {};
    var gx = function (i) { return x + (i % 3) * 4.6; }, gy = function (i) { return y + Math.floor(i / 3) * 4.6; };
    for (var i = 0; i < 4; i++) { var c = (n >>> (i * 4)) % 9; if (!used[c]) { used[c] = 1; pts.push(c); } }
    if (pts.length < 3) pts.push((pts[0] + 4) % 9);
    var d = 'M' + pts.map(function (c) { return gx(c).toFixed(1) + ',' + gy(c).toFixed(1); }).join(' L');
    el('path', { d: d, fill: 'none', stroke: fill, 'stroke-width': 1.9, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, g);
    var dot = (n >>> 20) % 9;
    if (!used[dot]) el('rect', { x: gx(dot) - 1.1, y: gy(dot) - 1.1, width: 2.2, height: 2.2, fill: fill }, g);
  };

  // Cherry-style modifier icons, drawn as strokes so they stay crisp at any size
  P.modIcon = function (g, icon, x, cy, fill, big) {
    var st = { fill: 'none', stroke: fill, 'stroke-width': 1.25, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, P = function (d) { el('path', Object.assign({ d: d }, st), g); };
    if (icon === 'bksp') { var L = big ? 16 : 8; P('M' + (x + L) + ',' + cy + ' H' + x + ' M' + (x + 3) + ',' + (cy - 2.6) + ' L' + x + ',' + cy + ' L' + (x + 3) + ',' + (cy + 2.6)); return L; }
    if (icon === 'enter') { var E = big ? 22 : 10, hh = big ? 6 : 4; P('M' + (x + E) + ',' + (cy - hh) + ' V' + cy + ' H' + x + ' M' + (x + 3) + ',' + (cy - 2.6) + ' L' + x + ',' + cy + ' L' + (x + 3) + ',' + (cy + 2.6)); return E; }
    if (icon === 'shift' || icon === 'caps') {
      var w = 9, h = 9.5, s2 = 2, t = icon === 'shift' ? 1 : -1, y0 = cy - t * h / 2, y1 = cy + t * h / 2, ym = y0 + t * 4.5;
      P('M' + (x + w / 2) + ',' + y0 + ' L' + (x + w) + ',' + ym + ' H' + (x + w / 2 + s2) + ' V' + y1 + ' H' + (x + w / 2 - s2) + ' V' + ym + ' H' + x + ' Z'); return w;
    }
    if (icon === 'tab') { // ⇤ over ⇥
      var T = 11, a = cy - 4, b = cy + 4;
      P('M' + (x + T) + ',' + a + ' H' + x + ' M' + x + ',' + (a - 2.6) + ' V' + (a + 2.6) + ' M' + (x + 3) + ',' + (a - 2.4) + ' L' + (x + 0.6) + ',' + a + ' L' + (x + 3) + ',' + (a + 2.4));
      P('M' + x + ',' + b + ' H' + (x + T) + ' M' + (x + T) + ',' + (b - 2.6) + ' V' + (b + 2.6) + ' M' + (x + T - 3) + ',' + (b - 2.4) + ' L' + (x + T - 0.6) + ',' + b + ' L' + (x + T - 3) + ',' + (b + 2.4)); return T;
    }
    return 0;
  };
  P.modSpec = function (g, sp, x, y, fill) {
    var tx = function (txt, ty, xx) { el('text', { x: xx == null ? x : xx, y: ty, fill: fill, 'class': 'pc-lg-gmk' }, g).textContent = txt; };
    var cy = y + 19.5;
    if (sp.at === 'tab3') { this.modIcon(g, 'tab', x, y + 15.5, fill); tx(sp.text, y + 22.5, x + 14.5); return; }
    if (sp.at === 'top') { var lines = sp.text.split('\n'); lines.forEach(function (t, i) { tx(t, y + 14.5 + i * 10.5); }); return; }
    if (sp.icon) {
      var iw = this.modIcon(g, sp.icon, x, sp.icon === 'tab' ? y + 19 : cy, fill, sp.big);
      if (sp.text) tx(sp.text, cy + 3.4, x + iw + 3.5);
      return;
    }
    if (sp.text) sp.text.split('\n').forEach(function (t, i, all) { tx(t, cy + 3.4 - (all.length - 1) * 5.2 + i * 10.4); });
  };

  P.legend = function (g, k, x, y, bg) {
    if (k.spec) return this.modSpec(g, k.spec, x, y, this.ink(bg));
    if (k.alien) return this.alienGlyph(g, k.l, x + 1, y + 10, this.ink(bg));
    var parts = String(k.l).split('\n'), fill = this.ink(bg);
    var t = function (txt, ty, cls) { el('text', { x: x, y: ty, fill: fill, 'class': cls }, g).textContent = txt; };
    if (k.c === 'alpha' && parts.length === 1) return t(parts[0], y + 23, 'pc-lg-alpha');
    if (parts.length === 2 && k.c === 'alpha') { t(parts[0], y + 17, 'pc-lg-pair'); t(parts[1], y + 31, 'pc-lg-pair'); return; }
    if (parts.length === 2 && k.c === 'mod' && parts[0].length === 1 && /[^\w|]/.test(parts[0])) { t(parts[0], y + 14.5, 'pc-lg-icon'); t(parts[1], y + 26.5, 'pc-lg-mod'); return; }
    if (parts.length === 2 && k.c !== 'alpha' && parts[0].length > 1) { t(parts[0], y + 18, 'pc-lg-mod'); t(parts[1], y + 30, 'pc-lg-mod'); return; }
    if (parts.length === 2) { t(parts[0], y + 17, k.gmk ? 'pc-lg-icon' : 'pc-lg-pair'); t(parts[1], y + 31, k.gmk ? 'pc-lg-icon' : 'pc-lg-pair'); return; }
    if (k.gmk && k.c !== 'alpha' && parts[0].length <= 2 && /[^\w]/.test(parts[0])) return t(parts[0], y + 21, 'pc-lg-glyph');
    t(parts[0], y + 19, 'pc-lg-mod');
  };

  // MX-style switch seen from above (54 px = 19.05 mm, so 1 mm ≈ 2.83 px):
  // bottom housing edges at the sides, square top housing with a raised center and side latches,
  // LED window on the north edge, stem shoulders with the + on top. delay (ms) animates it in.
  P.drawSwitch = function (g, k, x, y, sw, delay) {
    var h = (sw && sw.housing) || '#555', st = (sw && sw.stem) || '#999';
    var cx = k.c === 'isoenter' ? x + 0.875 * U : x + k.w * U / 2, cy = k.c === 'isoenter' ? y + U : y + U / 2;
    var sg = el('g', delay == null ? {} : { 'class': 'pc-sw-in', style: '--d:' + delay }, g);
    var dark = shade(h, -28), light = shade(h, 14), base = lum(h) > 0.5 ? shade(h, -12) : shade(h, 10);
    if (k.w >= 2) { // plate-mount stabilizer: two housings and the wire between them
      var span = k.w >= 6 ? 2.66 * U : (k.w >= 2.75 ? 0.94 * U : 0.62 * U);
      el('path', { d: 'M' + (cx - span) + ',' + (cy + 12) + ' L' + (cx + span) + ',' + (cy + 12), stroke: '#b7bbc0', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, sg);
      [-1, 1].forEach(function (d) {
        var sx = cx + d * span;
        el('rect', { x: sx - 5.5, y: cy - 9, width: 11, height: 19, rx: 2, fill: '#1c1d20', stroke: '#0e0e10', 'stroke-width': 0.8 }, sg);
        el('rect', { x: sx - 2.2, y: cy - 6, width: 4.4, height: 9, rx: 0.8, fill: '#3a3c40' }, sg);
        el('path', { d: 'M' + (sx - 1.6) + ',' + (cy - 1.5) + ' h3.2 M' + sx + ',' + (cy - 3.1) + ' v3.2', stroke: '#c9cdd2', 'stroke-width': 1.1 }, sg);
      });
    }
    // drop shadow on the plate, then the bottom housing flanges (left/right)
    el('rect', { x: cx - 21, y: cy - 19, width: 44, height: 42, rx: 4, fill: '#000', opacity: 0.28 }, sg);
    el('rect', { x: cx - 22.5, y: cy - 20, width: 45, height: 40, rx: 3, fill: base, stroke: dark, 'stroke-width': 0.8 }, sg);
    // top housing
    el('rect', { x: cx - 21, y: cy - 21, width: 42, height: 42, rx: 3.5, fill: h, stroke: dark, 'stroke-width': 1 }, sg);
    // latch notches on the east and west sides
    [-1, 1].forEach(function (d) {
      [-10, 6].forEach(function (oy) { el('rect', { x: cx + d * 21 - (d > 0 ? 2.6 : 0), y: cy + oy, width: 2.6, height: 5, fill: dark }, sg); });
    });
    // raised center with a sloped rim: lighter top, soft bevel lines
    el('rect', { x: cx - 16, y: cy - 16, width: 32, height: 32, rx: 2.5, fill: light, stroke: shade(h, -12), 'stroke-width': 0.7 }, sg);
    [[-21, -21, -16, -16], [21, -21, 16, -16], [-21, 21, -16, 16], [21, 21, 16, 16]].forEach(function (q) {
      el('line', { x1: cx + q[0], y1: cy + q[1], x2: cx + q[2], y2: cy + q[3], stroke: shade(h, -18), 'stroke-width': 0.7 }, sg);
    });
    // LED window, north edge
    el('rect', { x: cx - 5, y: cy - 19.5, width: 10, height: 4.5, rx: 1, fill: shade(h, -40), opacity: 0.85 }, sg);
    // stem opening, stem shoulders, then the + (4.1 x 1.3 mm arms)
    el('rect', { x: cx - 8.5, y: cy - 7, width: 17, height: 14, rx: 2, fill: shade(h, -45) }, sg);
    el('rect', { x: cx - 7, y: cy - 5.5, width: 14, height: 11, rx: 1.6, fill: shade(st, -14) }, sg);
    el('rect', { x: cx - 1.9, y: cy - 5.8, width: 3.8, height: 11.6, rx: 0.6, fill: st }, sg);
    el('rect', { x: cx - 5.8, y: cy - 1.9, width: 11.6, height: 3.8, rx: 0.6, fill: st }, sg);
    el('rect', { x: cx - 1.9, y: cy - 5.8, width: 3.8, height: 2.2, rx: 0.6, fill: shade(st, 25) }, sg);
  };

  P.drawBack = function (cur) {
    var W = 15 * U + PAD * 2, H = 5 * U + PAD * 2, k = cur.kase, self = this, L = this.look(k);
    var metal = cur.frame ? cur.frame.hex : '#c4c6c9';
    var svg = el('svg', { viewBox: '-20 -20 ' + (W + 40) + ' ' + (H + 70), 'class': 'pc-svg' });
    this.drawShell(svg, W, H, k, true);
    var defs = $('defs', svg), gid = 'pcmetal' + this.uid;
    var lg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': shade(metal, 16) }, lg);
    el('stop', { offset: '0.5', 'stop-color': shade(metal, -6) }, lg);
    el('stop', { offset: '1', 'stop-color': shade(metal, 8) }, lg);
    var weight = function (i) { return self.weightPath(i, true); };
    var ink = k.ghost ? '#2b2b2b' : shade(metal, -35);
    el('path', { d: weight(0), fill: k.ghost ? '#ffffff' : 'url(#' + gid + ')', stroke: ink, 'stroke-width': L.lw * 1.2, 'stroke-linejoin': 'round' }, svg);
    el('path', { d: weight(3.5), fill: 'none', stroke: ink, 'stroke-width': 0.9, 'stroke-opacity': k.ghost ? 1 : 0.5, 'stroke-linejoin': 'round' }, svg);
    // feet
    [[130, 200, 160, 212], [590, 200, 620, 212], [100, 347, 130, 359], [620, 347, 650, 359]].forEach(function (q) {
      var a = self.T(q[0], q[1]), b = self.T(q[2], q[3]);
      el('rect', { x: a[0], y: a[1], width: b[0] - a[0], height: b[1] - a[1], rx: 5, fill: k.ghost ? '#ffffff' : '#1b1b1d', stroke: k.ghost ? '#2b2b2b' : 'none', 'stroke-width': L.lw }, svg);
    });
    // USB-C opening, centered on the rear edge
    var u0 = this.T(361, 172), u1 = this.T(390, 186);
    el('rect', { x: u0[0], y: u0[1], width: u1[0] - u0[0], height: u1[1] - u0[1], rx: (u1[1] - u0[1]) / 2, fill: k.ghost ? '#ffffff' : '#111', stroke: k.ghost ? '#2b2b2b' : 'none', 'stroke-width': L.lw }, svg);
    var mark = this.T(375, 355);
    el('text', { x: mark[0], y: mark[1], 'text-anchor': 'middle', 'class': 'pc-mark', fill: k.ghost ? '#2b2b2b' : shade(k.hex, -55), 'fill-opacity': k.ghost ? 1 : 0.8 }, svg).textContent = 'PANGEA';
    return svg;
  };

  /* ----- summary + cart ----- */
  P.lines = function () {
    var cur = this.current(), s = this.state, c = this.cfg, out = [];
    if (!cur.kase) return [];
    out.push({ label: (c.kitLabel || 'Pangea Mini IM') + ', ' + cur.kase.name + (cur.frame ? ' / ' + cur.frame.name : ''), variant: cur.kit });
    if (this.step() < 2) return out;
    if (cur.sw) out.push({ label: cur.sw.name + ' switches', variant: cur.sw.variant });
    if (cur.kc) out.push({ label: cur.kc.custom ? 'Custom keycaps' : cur.kc.name + ' keycaps, ' + LANG[s.lang], variant: cur.kcVariant, quoted: cur.kc.custom && !cur.kcVariant });
    if (c.assembly) out.push({ label: c.assembly.title || 'Assembly', variant: c.assembly });
    return out;
  };

  P.renderSummary = function () {
    var self = this, s = this.state, total = 0;
    $('[data-lines]', this.root).innerHTML = this.lines().map(function (l) {
      if (l.variant) total += l.variant.price;
      return '<li><span>' + esc(l.label) + '</span><span>' + (l.missing ? 'Not picked' : l.quoted ? 'Quoted' : self.price(l.variant)) + '</span></li>';
    }).join('');
    var t = this.money.format(total * s.qty / 100);
    $('[data-total]', this.root).textContent = t;
    $('[data-total-top]', this.root).textContent = this.money.format(total / 100);
    var step = this.step(), cur = this.current(), add = $('[data-add]', this.root);
    var need = step === 0 ? 'Pick a body' : step === 1 ? 'Pick a frame' : !cur.sw ? 'Pick switches' : !cur.kc ? 'Pick keycaps' : '';
    add.disabled = !!need || !!this.busy;
    add.textContent = need || (this.busy ? 'Adding' : 'Add to cart');
    $('[data-total-top]', this.root).hidden = step === 0;
  };

  P.payload = function () {
    var s = this.state, cur = this.current(), c = this.cfg, gid = 'PM-' + Date.now().toString(36).toUpperCase();
    var props = { 'Body': cur.kase.name };
    if (cur.frame) props['Frame and weight'] = cur.frame.name;
    Object.assign(props, { 'Switches': cur.sw.name, 'Keycaps': cur.kc.name, 'Layout': LONG[s.lang], 'Bottom row': LONG[s.row], 'Right shift': LONG[s.shift] });
    if (cur.kc.custom && s.notes.trim()) props['Custom keycaps'] = s.notes.trim();
    props['Build link'] = this.shareUrl();
    props._build = gid;
    var part = { 'Build': gid, _build: gid }, items = [{ id: cur.kit.id, quantity: s.qty, properties: props }];
    if (cur.sw.variant) items.push({ id: cur.sw.variant.id, quantity: s.qty, properties: part });
    if (cur.kcVariant) items.push({ id: cur.kcVariant.id, quantity: s.qty, properties: part });
    if (c.assembly) items.push({ id: c.assembly.id, quantity: s.qty, properties: part });
    return { items: items.reverse() }; // Shopify lists the newest line first; this keeps the kit on top
  };

  P.fail = function (msg) { var e = $('[data-error]', this.root); e.textContent = msg; e.hidden = !msg; };

  P.addToCart = function () {
    var self = this, cur = this.current();
    this.fail('');
    if (this.step() < 2) return this.fail('Pick a body and a frame first.');
    if (!cur.kit) return this.fail('This body and frame combination isn\'t linked to a product variant yet.');
    if (!cur.sw) return this.fail('Pick switches first.');
    if (!cur.kc) return this.fail('Pick keycaps first.');
    var body = this.payload();
    if (this.cfg.demo) { (window.PangeaDemoCart || function () {})(body, this); return; }
    this.busy = true; this.renderSummary();
    fetch((this.cfg.root || '/') + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add to cart.'); return j; }); })
      .then(function () {
        document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
        document.dispatchEvent(new CustomEvent('pangea:added', { detail: body }));
        if (self.cfg.afterAdd !== 'stay') location.href = (self.cfg.root || '/') + 'cart';
      })
      .catch(function (err) { self.fail(err.message); })
      .then(function () { self.busy = false; self.renderSummary(); });
  };

  function mountAll() {
    $$('[data-pangea-configurator]').forEach(function (host) {
      if (host.__pc) return;
      var src = $('script[data-pc-config]', host);
      if (!src) return;
      var cfg; try { cfg = JSON.parse(src.textContent); } catch (e) { host.textContent = 'Configurator settings could not be read.'; return; }
      var mount = document.createElement('div'); host.appendChild(mount);
      host.__pc = new Configurator(mount, cfg);
    });
  }
  window.PangeaConfigurator = { mount: mountAll, Configurator: Configurator };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll); else mountAll();
  document.addEventListener('shopify:section:load', mountAll);
})();
