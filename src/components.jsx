import React, { useState, useEffect, useRef } from 'react';

/* ---------- Icons (stroke, 24 grid) ---------- */
const ico = (paths, opts = {}) => ({ size = 22, stroke = 2, ...p } = {}) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: opts.fill || 'none',
    stroke: opts.fill ? 'none' : 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...p
  }, paths.map((d, i) => React.createElement(opts.tag?.[i] || 'path',
    typeof d === 'string' ? { key: i, d } : { key: i, ...d })));

export const Icons = {
  Concept: ico(['M12 3a4 4 0 0 0-4 4 3.5 3.5 0 0 0-2 6.3A3.5 3.5 0 0 0 8 20a3 3 0 0 0 4 .8A3 3 0 0 0 16 20a3.5 3.5 0 0 0 2-6.7A3.5 3.5 0 0 0 16 7a4 4 0 0 0-4-4Z', 'M12 3v18']),
  App: ico([{ tag: 'rect' }, 'M9 9h6v6H9z'], { tag: ['rect'] }),
  System: ico(['M4 4h16v12H4z', 'M2 20h20', 'M9 16v4', 'M15 16v4']),
  Shield: ico(['M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z', 'm9 11 2 2 4-4']),
  Clock: ico(['M12 7v5l3 2', { tag: 'circle', cx: 12, cy: 12, r: 9 }]),
  Star: ico(['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z']),
  StarFill: ico(['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z'], { fill: 1 }),
  Check: ico(['m4 12 5 5L20 6']),
  X: ico(['M6 6l12 12', 'M18 6 6 18']),
  Right: ico(['m9 5 7 7-7 7']),
  Left: ico(['m15 5-7 7 7 7']),
  ArrowR: ico(['M4 12h16', 'm13 5 7 7-7 7']),
  Flag: ico(['M5 21V4', 'M5 4h11l-1.5 3.5L16 11H5']),
  Redo: ico(['M3 9a9 9 0 1 1-2 5', 'M3 4v5h5']),
  Chart: ico(['M4 20V4', 'M4 20h16', 'M8 16v-4', 'M13 16V8', 'M18 16v-7']),
  Keyboard: ico([{ tag: 'rect' }, 'M7 10h.01M11 10h.01M15 10h.01M7 14h10'], { tag: ['rect'] }),
  Home: ico(['M4 11l8-7 8 7', 'M6 10v9h12v-9']),
  Trophy: ico(['M8 4h8v5a4 4 0 0 1-8 0V4Z', 'M8 6H5v1a3 3 0 0 0 3 3', 'M16 6h3v1a3 3 0 0 1-3 3', 'M10 14h4', 'M9 20h6', 'M12 14v6']),
  Pencil: ico(['M4 20h4L19 9l-4-4L4 16v4Z', 'm13.5 6.5 4 4']),
  Layers: ico(['m12 3 9 5-9 5-9-5 9-5Z', 'm3 13 9 5 9-5']),
  Dice: ico([{ tag: 'rect' }, 'M8.5 8.5h.01M15.5 8.5h.01M8.5 15.5h.01M15.5 15.5h.01M12 12h.01'], { tag: ['rect'] }),
  Target: ico([{ tag: 'circle', cx: 12, cy: 12, r: 8 }, { tag: 'circle', cx: 12, cy: 12, r: 4 }, { tag: 'circle', cx: 12, cy: 12, r: 0.6 }]),
  Book: ico(['M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z', 'M8 7h7M8 11h7']),
  Trash: ico(['M4 7h16', 'M9 7V5h6v2', 'M7 7l1 13h8l1-13']),
  Info: ico([{ tag: 'circle', cx: 12, cy: 12, r: 9 }, 'M12 11v5', 'M12 7.5h.01']),
  List: ico(['M8 6h12M8 12h12M8 18h12', 'M4 6h.01M4 12h.01M4 18h.01']),
  Sparkle: ico(['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z']),
};

export function IconWrap(name, props) {
  const C = Icons[name];
  return C ? React.createElement(C, props) : null;
}

/* ---------- Ring progress ---------- */
export function Ring({ value = 0, size = 64, stroke = 7, color = 'var(--brand-600)', track = 'var(--ink-200)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, value)));
  return React.createElement('div', { style: { position: 'relative', width: size, height: size, flex: 'none' } },
    React.createElement('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
      React.createElement('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: track, strokeWidth: stroke }),
      React.createElement('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: color, strokeWidth: stroke,
        strokeDasharray: c, strokeDashoffset: off, strokeLinecap: 'round',
        style: { transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' } })),
    children && React.createElement('div', { style: { position: 'absolute', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column' } }, children));
}

/* ---------- Linear bar ---------- */
export function Bar({ value = 0, color = 'var(--brand-600)', h = 8 }) {
  return React.createElement('div', { style: { height: h, background: 'var(--ink-200)', borderRadius: 99, overflow: 'hidden' } },
    React.createElement('div', { style: { height: '100%', width: (Math.max(0, Math.min(1, value)) * 100) + '%',
      background: color, borderRadius: 99, transition: 'width .5s cubic-bezier(.4,0,.2,1)' } }));
}

export const ITEM_META = {
  '01': { icon: 'Concept', color: '#1f6fb2', tint: '#e7f1fa', label: '電腦概論' },
  '02': { icon: 'App',     color: '#7a3ea8', tint: '#f1e8fa', label: '應用軟體使用' },
  '03': { icon: 'System',  color: '#1c8a52', tint: '#e3f5ec', label: '系統軟體使用' },
  '04': { icon: 'Shield',  color: '#c5283b', tint: '#fbe7ea', label: '資訊安全' },
};

export const fmtTime = s => {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
};

export const OPT_LABELS = ['①', '②', '③', '④'];
