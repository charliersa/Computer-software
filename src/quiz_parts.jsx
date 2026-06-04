import React, { useState, useRef } from 'react';
import { IconWrap, OPT_LABELS } from './components';
import { Key } from './chrome';

export function QuestionCard({ q, m, idx, exam, pick, isLocked, starred, onChoose, onStar, note, onNote }) {
  return React.createElement('div', { className: 'card', style: { padding: '30px 34px 34px', boxShadow: 'var(--sh-2)' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('span', { className: 'tag', style: { background: m.tint, color: m.color, fontSize: 12.5 } },
          IconWrap(m.icon, { size: 14 }), q.itemNum + ' ' + m.label),
        React.createElement('span', { style: { fontSize: 12.5, color: 'var(--ink-400)', fontWeight: 600 } }, '題庫第 ',
          React.createElement('span', { className: 'tnum' }, q.n), ' 題')),
      React.createElement('button', { onClick: onStar, title: '標記 (S)',
        style: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9, fontWeight: 700, fontSize: 13,
          border: '1px solid ' + (starred ? 'var(--star-100)' : 'var(--ink-200)'),
          background: starred ? 'var(--star-100)' : 'var(--paper)', color: starred ? 'var(--star-600)' : 'var(--ink-400)',
          transition: 'all .12s' } },
        IconWrap(starred ? 'StarFill' : 'Star', { size: 16 }), starred ? '已標記' : '標記')),
    React.createElement('div', { style: { fontSize: 21.5, lineHeight: 1.65, fontWeight: 600, color: 'var(--navy-900)',
      letterSpacing: '.2px', textWrap: 'pretty', marginBottom: 22 } }, q.q),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
      q.o.map((text, i) => {
        const n = i + 1;
        let cls = 'default';
        if (isLocked) { if (n === q.a) cls = 'correct'; else if (n === pick) cls = 'wrong'; else cls = 'dim'; }
        else if (pick === n) cls = 'selected';
        return React.createElement(Option, { key: i, n, text, cls, exam, locked: isLocked, onClick: () => onChoose(n) });
      })),
    !exam && isLocked && React.createElement(Feedback, { q, m, pick, note, onNote }));
}

export function Option({ n, text, cls, onClick, locked }) {
  const palette = {
    default:  { bd: 'var(--ink-200)',   bg: 'var(--paper)',    badgeBg: 'var(--ink-100)',   badgeCo: 'var(--ink-500)',  tc: 'var(--ink-800)' },
    selected: { bd: 'var(--brand-600)', bg: 'var(--brand-50)', badgeBg: 'var(--brand-600)', badgeCo: '#fff',            tc: 'var(--navy-900)' },
    correct:  { bd: 'var(--ok-600)',    bg: 'var(--ok-50)',    badgeBg: 'var(--ok-600)',    badgeCo: '#fff',            tc: 'var(--ok-700)' },
    wrong:    { bd: 'var(--bad-600)',   bg: 'var(--bad-50)',   badgeBg: 'var(--bad-600)',   badgeCo: '#fff',            tc: 'var(--bad-700)' },
    dim:      { bd: 'var(--ink-150)',   bg: 'var(--paper)',    badgeBg: 'var(--ink-100)',   badgeCo: 'var(--ink-300)',  tc: 'var(--ink-400)' },
  }[cls];
  const showIcon = cls === 'correct' ? 'Check' : cls === 'wrong' ? 'X' : null;
  return React.createElement('button', { onClick: locked ? undefined : onClick, disabled: locked,
    style: { display: 'flex', alignItems: 'center', gap: 15, textAlign: 'left', width: '100%',
      padding: '15px 18px', borderRadius: 12, border: '1.5px solid ' + palette.bd, background: palette.bg,
      cursor: locked ? 'default' : 'pointer', transition: 'all .13s ease',
      boxShadow: cls === 'selected' ? '0 0 0 3px color-mix(in oklab,var(--brand-500),white 70%)' : 'none' },
    onMouseEnter: e => { if (!locked && cls === 'default') { e.currentTarget.style.borderColor = 'var(--brand-500)'; e.currentTarget.style.background = 'var(--brand-50)'; } },
    onMouseLeave: e => { if (!locked && cls === 'default') { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.background = 'var(--paper)'; } } },
    React.createElement('span', { className: 'tnum', style: { width: 30, height: 30, borderRadius: 8, flex: 'none',
      display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15,
      background: palette.badgeBg, color: palette.badgeCo, transition: 'all .13s' } },
      showIcon ? IconWrap(showIcon, { size: 18, stroke: 2.6 }) : n),
    React.createElement('span', { style: { fontSize: 16.5, fontWeight: 600, color: palette.tc, lineHeight: 1.5, flex: 1, textWrap: 'pretty' } }, text));
}

export function Feedback({ q, m, pick, note, onNote }) {
  const ok = pick === q.a;
  const [saved, setSaved] = useState(false);
  const tRef = useRef();
  const handle = (e) => {
    onNote(e.target.value);
    setSaved(true);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setSaved(false), 1400);
  };
  return React.createElement('div', { className: 'fade-in', style: { marginTop: 22 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12,
      background: ok ? 'var(--ok-50)' : 'var(--bad-50)', border: '1px solid ' + (ok ? 'var(--ok-100)' : 'var(--bad-100)') } },
      React.createElement('div', { style: { width: 30, height: 30, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center',
        background: ok ? 'var(--ok-600)' : 'var(--bad-600)', color: '#fff' } }, IconWrap(ok ? 'Check' : 'X', { size: 19, stroke: 2.6 })),
      React.createElement('div', { style: { fontWeight: 800, fontSize: 15.5, color: ok ? 'var(--ok-700)' : 'var(--bad-700)' } },
        ok ? '答對了！' : '答錯了'),
      !ok && React.createElement('div', { style: { fontSize: 14.5, color: 'var(--ink-600)' } }, '正確答案為 ',
        React.createElement('b', { style: { color: 'var(--ok-700)' } }, OPT_LABELS[q.a - 1])),
      React.createElement('div', { style: { marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-400)', fontWeight: 600 } },
        q.itemNum + ' ' + m.label)),
    React.createElement('div', { style: { marginTop: 14 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 } },
        IconWrap('Pencil', { size: 15 }),
        React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: 'var(--ink-600)' } }, '我的解析筆記'),
        saved && React.createElement('span', { style: { fontSize: 12, color: 'var(--ok-600)', fontWeight: 600 } }, '· 已儲存')),
      React.createElement('textarea', { value: note, onChange: handle, rows: 2,
        placeholder: '在此加註記憶點、觀念或為什麼選錯…（自動儲存於本機）',
        style: { width: '100%', resize: 'vertical', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--ink-200)',
          fontSize: 14.5, color: 'var(--ink-800)', background: 'var(--ink-50)', lineHeight: 1.6, minHeight: 54 } })));
}

export function Palette({ ctx, questions, answers, idx, setIdx, answered, onSubmit }) {
  const N = questions.length;
  return React.createElement('aside', { style: { position: 'sticky', top: 86 } },
    React.createElement('div', { className: 'card', style: { padding: '18px 18px 20px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 } },
        React.createElement('span', { style: { fontWeight: 800, fontSize: 14.5, color: 'var(--navy-900)' } }, '答題卡'),
        React.createElement('span', { className: 'tnum', style: { fontSize: 13, color: 'var(--ink-500)', fontWeight: 700 } }, answered + ' / ' + N)),
      React.createElement('div', { style: { marginBottom: 14 } }),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 7 } },
        questions.map((qq, i) => {
          const done = !!answers[qq.id]; const cur = i === idx; const star = !!ctx.store.starred[qq.id];
          return React.createElement('button', { key: qq.id, onClick: () => setIdx(i), title: '第' + (i + 1) + '題',
            style: { position: 'relative', aspectRatio: '1', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              display: 'grid', placeItems: 'center', transition: 'all .1s',
              border: '1.5px solid ' + (cur ? 'var(--brand-600)' : done ? 'transparent' : 'var(--ink-200)'),
              background: done ? 'var(--navy-800)' : 'var(--paper)', color: done ? '#fff' : 'var(--ink-500)',
              boxShadow: cur ? '0 0 0 3px color-mix(in oklab,var(--brand-500),white 65%)' : 'none' } },
            React.createElement('span', { className: 'tnum' }, i + 1),
            star && React.createElement('span', { style: { position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: 99,
              background: 'var(--star-500)', border: '1.5px solid var(--paper)' } }));
        })),
      React.createElement('div', { style: { display: 'flex', gap: 14, marginTop: 15, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 } },
        React.createElement(Legend, { c: 'var(--navy-800)', label: '已作答' }),
        React.createElement(Legend, { c: 'var(--paper)', bd: true, label: '未作答' }),
        React.createElement(Legend, { c: 'var(--star-500)', dot: true, label: '已標記' })),
      React.createElement('button', { className: 'btn btn-dark', style: { width: '100%', marginTop: 18 }, onClick: onSubmit },
        IconWrap('Flag', { size: 16 }), '交卷計分')));
}

export function Legend({ c, label, bd, dot }) {
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
    React.createElement('span', { style: { width: dot ? 9 : 13, height: dot ? 9 : 13, borderRadius: dot ? 99 : 4, background: c,
      border: bd ? '1.5px solid var(--ink-300)' : 'none' } }), label);
}
