import React, { useState, useMemo } from 'react';
import { IconWrap, ITEM_META } from './components';
import { TOTAL_Q } from './data/quizData';

export function PracticeLauncher({ ctx, initial, onClose }) {
  const { stats, startQuiz, DATA } = ctx;
  const [scope, setScope] = useState(initial?.type || 'all');
  const [item, setItem] = useState(initial?.item || '01');
  const [count, setCount] = useState(20);
  const [order, setOrder] = useState('random');

  const poolSize = useMemo(() => {
    if (scope === 'item') return DATA.items.find(i => i.num === item).questions.length;
    if (scope === 'star') return stats.starredIds.length;
    if (scope === 'wrong') return stats.wrongIds.length;
    return TOTAL_Q;
  }, [scope, item, stats, DATA]);

  const scopes = [
    { k: 'all',   label: '全部題庫', n: TOTAL_Q,               ic: 'Layers' },
    { k: 'item',  label: '工作項目', n: '—',                    ic: 'List' },
    { k: 'star',  label: '星號標記', n: stats.starredIds.length, ic: 'Star' },
    { k: 'wrong', label: '錯題',     n: stats.wrongIds.length,  ic: 'Redo' },
  ];
  const counts = [20, 40, 80].filter(c => c < poolSize);
  const launch = () => {
    const lbl = scope === 'item' ? ITEM_META[item].label : scopes.find(s => s.k === scope).label;
    startQuiz({ mode: 'practice', scope: { type: scope, item }, count: Math.min(count, poolSize), order, scopeLabel: lbl });
  };
  const empty = poolSize === 0;

  const Row = ({ title, children }) => React.createElement('div', { style: { marginTop: 22 } },
    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--ink-500)',
      letterSpacing: '.5px', marginBottom: 10 } }, title), children);
  const chip = (active, disabled) => ({
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '9px 15px', borderRadius: 10, fontWeight: 700, fontSize: 14,
    border: '1.5px solid ' + (active ? 'var(--brand-600)' : 'var(--ink-200)'),
    background: active ? 'var(--brand-50)' : 'var(--paper)', color: active ? 'var(--brand-600)' : 'var(--ink-600)',
    opacity: disabled ? .4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .12s',
  });

  return React.createElement('div', { style: { padding: '30px 32px 28px' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 } },
      React.createElement('div', { style: { width: 34, height: 34, borderRadius: 9, background: 'var(--brand-50)',
        color: 'var(--brand-600)', display: 'grid', placeItems: 'center' } }, IconWrap('Sparkle', { size: 20 })),
      React.createElement('h2', { style: { margin: 0, fontSize: 21, color: 'var(--navy-900)', fontWeight: 800 } }, '練習模式')),
    React.createElement('p', { style: { margin: '2px 0 0', color: 'var(--ink-500)', fontSize: 14 } }, '作答後立即顯示對錯與解析。'),

    React.createElement(Row, { title: '測驗範圍' },
      React.createElement('div', { style: { display: 'flex', gap: 9, flexWrap: 'wrap' } },
        scopes.map(s => {
          const dis = (s.k === 'star' || s.k === 'wrong') && s.n === 0;
          return React.createElement('button', { key: s.k, disabled: dis, onClick: () => setScope(s.k), style: chip(scope === s.k, dis) },
            IconWrap(s.ic, { size: 16 }), s.label,
            React.createElement('span', { className: 'tnum', style: { fontSize: 12, opacity: .7, fontWeight: 600 } }, s.k === 'item' ? '' : s.n));
        }))),

    scope === 'item' && React.createElement(Row, { title: '選擇工作項目' },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 } },
        DATA.items.map(it => {
          const m = ITEM_META[it.num]; const active = item === it.num;
          return React.createElement('button', { key: it.num, onClick: () => setItem(it.num),
            style: { ...chip(active), justifyContent: 'flex-start', padding: '11px 13px' } },
            React.createElement('span', { style: { width: 24, height: 24, borderRadius: 7, background: active ? '#fff' : m.tint,
              color: m.color, display: 'grid', placeItems: 'center', flex: 'none' } }, IconWrap(m.icon, { size: 15 })),
            React.createElement('span', { style: { flex: 1, textAlign: 'left' } }, it.num + ' ' + m.label),
            React.createElement('span', { className: 'tnum', style: { fontSize: 12, opacity: .6 } }, it.questions.length));
        }))),

    React.createElement(Row, { title: '題數' },
      React.createElement('div', { style: { display: 'flex', gap: 9, flexWrap: 'wrap' } },
        [...counts, poolSize].map((c, i) => {
          const label = i === counts.length ? ('全部 ' + poolSize) : c;
          return React.createElement('button', { key: i, onClick: () => setCount(c), style: chip(count === c || (i === counts.length && count === poolSize)) }, label);
        }))),

    React.createElement(Row, { title: '出題順序' },
      React.createElement('div', { style: { display: 'flex', gap: 9 } },
        [['random', '隨機抽題', 'Dice'], ['seq', '依題號順序', 'List']].map(o =>
          React.createElement('button', { key: o[0], onClick: () => setOrder(o[0]), style: chip(order === o[0]) },
            IconWrap(o[2], { size: 16 }), o[1])))),

    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 30, paddingTop: 20, borderTop: '1px solid var(--ink-150)' } },
      React.createElement('div', { style: { fontSize: 13.5, color: 'var(--ink-500)' } },
        empty ? '此範圍目前沒有題目' : React.createElement('span', null, '本回合 ',
          React.createElement('b', { className: 'tnum', style: { color: 'var(--navy-800)', fontSize: 16 } }, Math.min(count, poolSize)), ' 題')),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { className: 'btn btn-quiet', onClick: onClose }, '取消'),
        React.createElement('button', { className: 'btn btn-primary', disabled: empty, onClick: launch },
          IconWrap('ArrowR', { size: 18 }), '開始練習'))));
}

export function ExamIntro({ ctx, onClose }) {
  const { startQuiz } = ctx;
  const rules = [
    ['List',  '題數', '80 題（自全題庫隨機抽出）'],
    ['Clock', '時間', '60 分鐘，時間到自動交卷'],
    ['Flag',  '計分', '作答完成後一次計分，過程不顯示對錯'],
    ['Star',  '標記', '可標記不確定的題目，最後檢視'],
  ];
  return React.createElement('div', { style: { padding: '0 0 28px' } },
    React.createElement('div', { style: { padding: '30px 32px 22px', background: 'linear-gradient(160deg,var(--navy-800),var(--navy-900))',
      borderRadius: 'var(--r-xl) var(--r-xl) 0 0', color: '#fff' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        React.createElement('div', { style: { width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,.14)',
          display: 'grid', placeItems: 'center' } }, IconWrap('Trophy', { size: 24 })),
        React.createElement('div', null,
          React.createElement('h2', { style: { margin: 0, fontSize: 22, fontWeight: 800 } }, '模擬考'),
          React.createElement('div', { style: { fontSize: 13.5, opacity: .8, marginTop: 2 } }, '仿真檢定 · 學科測試')))),
    React.createElement('div', { style: { padding: '8px 32px 0' } },
      rules.map((r, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 14, alignItems: 'center',
        padding: '15px 0', borderBottom: i < 3 ? '1px solid var(--ink-150)' : 'none' } },
        React.createElement('div', { style: { width: 36, height: 36, borderRadius: 9, background: 'var(--brand-50)',
          color: 'var(--brand-600)', display: 'grid', placeItems: 'center', flex: 'none' } }, IconWrap(r[0], { size: 19 })),
        React.createElement('div', null,
          React.createElement('div', { style: { fontWeight: 700, fontSize: 14.5, color: 'var(--navy-900)' } }, r[1]),
          React.createElement('div', { style: { fontSize: 13.5, color: 'var(--ink-500)', marginTop: 1 } }, r[2]))))),
    React.createElement('div', { style: { display: 'flex', gap: 11, justifyContent: 'flex-end', padding: '24px 32px 0' } },
      React.createElement('button', { className: 'btn btn-quiet', onClick: onClose }, '取消'),
      React.createElement('button', { className: 'btn btn-dark btn-lg',
        onClick: () => startQuiz({ mode: 'exam', scope: { type: 'all' }, count: 80, order: 'random', timeLimit: 60 * 60, scopeLabel: '模擬考' }) },
        IconWrap('ArrowR', { size: 18 }), '開始模擬考')));
}
