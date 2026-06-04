import React, { useState, useMemo } from 'react';
import { IconWrap, Ring, Bar, ITEM_META, fmtTime, OPT_LABELS } from './components';
import { TopBar } from './chrome';
import { Q_BY_ID } from './data/quizData';

export function ResultScreen({ ctx, payload }) {
  const { go, store, toggleStar, setNote, startQuiz, stats } = ctx;
  const s = payload;
  const exam = s.mode === 'exam';
  const pct = Math.round((s.correct / s.total) * 100);
  const pass = pct >= 60;
  const wrongN = s.details.filter(d => !d.ok && d.pick).length;
  const blankN = s.details.filter(d => !d.pick).length;

  const [filter, setFilter] = useState('wrong');
  const list = useMemo(() => s.details.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'wrong') return !d.ok;
    if (filter === 'star') return !!store.starred[d.id];
    return true;
  }), [filter, store.starred]);

  const byItem = useMemo(() => {
    const map = {};
    s.details.forEach(d => { const k = d.itemNum; (map[k] = map[k] || { total: 0, ok: 0 }); map[k].total++; if (d.ok) map[k].ok++; });
    return Object.keys(map).sort().map(k => ({ num: k, ...map[k] }));
  }, [s]);

  const right = React.createElement('button', { className: 'btn btn-ghost', onClick: () => go({ name: 'home' }) },
    IconWrap('Home', { size: 17 }), '回首頁');
  const accentCol = pass ? 'var(--ok-600)' : 'var(--bad-600)';

  return React.createElement('div', { style: { minHeight: '100vh', paddingBottom: 70 } },
    React.createElement(TopBar, { ctx, right, onBrand: () => go({ name: 'home' }) }),
    React.createElement('main', { className: 'shell fade-in', style: { paddingTop: 26 } },

      React.createElement('section', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 34, alignItems: 'center',
        background: exam ? 'linear-gradient(155deg,#16456f,#0b2545)' : 'var(--paper)',
        color: exam ? '#fff' : 'var(--ink-800)', border: exam ? 'none' : '1px solid var(--ink-200)',
        borderRadius: 'var(--r-xl)', padding: '34px 38px', boxShadow: 'var(--sh-3)', marginBottom: 24 } },
        React.createElement(Ring, { value: s.correct / s.total, size: 150, stroke: 14,
          color: exam ? '#fff' : accentCol, track: exam ? 'rgba(255,255,255,.18)' : 'var(--ink-200)' },
          React.createElement('div', { className: 'tnum', style: { fontSize: 42, fontWeight: 800, lineHeight: 1 } }, pct),
          React.createElement('div', { style: { fontSize: 13, opacity: .7, fontWeight: 700, marginTop: 2 } }, '分')),
        React.createElement('div', null,
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 } },
            React.createElement('h1', { style: { margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: '.3px' } },
              exam ? (pass ? '恭喜，及格！' : '未達及格標準') : '練習完成'),
            exam && React.createElement('span', { className: 'tag', style: { fontSize: 13, padding: '5px 12px',
              background: pass ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.14)', color: '#fff' } },
              pass ? IconWrap('Check', { size: 14 }) : IconWrap('Info', { size: 14 }), pass ? '達 60 分' : '低於 60 分')),
          React.createElement('p', { style: { margin: '0 0 20px', fontSize: 14.5, opacity: exam ? .82 : 1, color: exam ? '#fff' : 'var(--ink-500)' } },
            s.scopeLabel + (s.auto ? '（時間到自動交卷）' : '') + ' · 用時 ' + fmtTime(s.dur)),
          React.createElement('div', { style: { display: 'flex', gap: 30, flexWrap: 'wrap' } },
            [['答對', s.correct, exam ? '#9ff0c4' : 'var(--ok-600)'], ['答錯', wrongN, exam ? '#ffb3bd' : 'var(--bad-600)'],
             ['未作答', blankN, exam ? 'rgba(255,255,255,.7)' : 'var(--ink-400)'], ['總題數', s.total, exam ? '#fff' : 'var(--navy-800)']].map((x, i) =>
              React.createElement('div', { key: i },
                React.createElement('div', { className: 'tnum', style: { fontSize: 26, fontWeight: 800, color: x[2] } }, x[1]),
                React.createElement('div', { style: { fontSize: 12.5, fontWeight: 600, opacity: exam ? .75 : 1,
                  color: exam ? '#fff' : 'var(--ink-500)', marginTop: 1 } }, x[0])))))),

      React.createElement('div', { style: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' } },
        exam && React.createElement('button', { className: 'btn btn-primary btn-lg',
          onClick: () => startQuiz({ mode: 'exam', scope: { type: 'all' }, count: 80, order: 'random', timeLimit: 3600, scopeLabel: '模擬考' }) },
          IconWrap('Redo', { size: 18 }), '再考一次'),
        stats.wrongIds.length > 0 && React.createElement('button', { className: (exam ? 'btn btn-ghost' : 'btn btn-primary') + ' btn-lg',
          onClick: () => startQuiz({ mode: 'practice', scope: { type: 'wrong' }, count: 9999, order: 'random', scopeLabel: '錯題複習' }) },
          IconWrap('Redo', { size: 18 }), '複習錯題（' + stats.wrongIds.length + '）'),
        React.createElement('button', { className: 'btn btn-ghost btn-lg', onClick: () => go({ name: 'home' }) },
          IconWrap('Home', { size: 18 }), '回首頁')),

      byItem.length > 1 && React.createElement('div', { className: 'card', style: { padding: '22px 26px', marginBottom: 24 } },
        React.createElement('h3', { style: { margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: 'var(--navy-900)' } }, '各工作項目表現'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 34px' } },
          byItem.map(b => {
            const mm = ITEM_META[b.num]; const r = b.ok / b.total;
            return React.createElement('div', { key: b.num, style: { display: 'flex', alignItems: 'center', gap: 13 } },
              React.createElement('span', { style: { width: 34, height: 34, borderRadius: 9, background: mm.tint, color: mm.color,
                display: 'grid', placeItems: 'center', flex: 'none' } }, IconWrap(mm.icon, { size: 18 })),
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 } },
                  React.createElement('span', { style: { fontWeight: 700, fontSize: 14, color: 'var(--navy-900)' } }, mm.label),
                  React.createElement('span', { className: 'tnum', style: { fontSize: 13, fontWeight: 700,
                    color: r >= .6 ? 'var(--ok-600)' : 'var(--bad-600)' } }, b.ok + '/' + b.total)),
                React.createElement(Bar, { value: r, color: r >= .6 ? 'var(--ok-600)' : 'var(--bad-600)', h: 7 })));
          }))),

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy-900)' } }, '作答檢討'),
        React.createElement('div', { style: { display: 'flex', gap: 7, background: 'var(--ink-100)', padding: 4, borderRadius: 11 } },
          [['wrong', '錯題 ' + s.details.filter(d => !d.ok).length], ['all', '全部 ' + s.total],
           ['star', '標記 ' + s.details.filter(d => store.starred[d.id]).length]].map(t =>
            React.createElement('button', { key: t[0], onClick: () => setFilter(t[0]),
              style: { padding: '7px 15px', borderRadius: 8, fontWeight: 700, fontSize: 13.5, transition: 'all .12s',
                background: filter === t[0] ? 'var(--paper)' : 'transparent', color: filter === t[0] ? 'var(--navy-900)' : 'var(--ink-500)',
                boxShadow: filter === t[0] ? 'var(--sh-1)' : 'none' } }, t[1])))),

      list.length === 0
        ? React.createElement('div', { className: 'card', style: { padding: '48px 0', textAlign: 'center', color: 'var(--ink-400)' } },
            IconWrap('Check', { size: 30 }),
            React.createElement('div', { style: { marginTop: 8, fontSize: 14.5, fontWeight: 600 } },
              filter === 'wrong' ? '太強了，這個範圍全部答對！' : '沒有符合的題目'))
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
            list.map((d, i) => React.createElement(ReviewItem, { key: d.id, d, n: i + 1, ctx, store, toggleStar, setNote })))));
}

function ReviewItem({ d, n, ctx, store, toggleStar, setNote }) {
  const q = Q_BY_ID[d.id]; const m = ITEM_META[q.itemNum];
  const starred = !!store.starred[d.id];
  const [open, setOpen] = useState(false);
  const note = store.notes[d.id] || '';
  return React.createElement('div', { className: 'card', style: { padding: '20px 24px',
    borderLeft: '4px solid ' + (d.ok ? 'var(--ok-600)' : d.pick ? 'var(--bad-600)' : 'var(--ink-300)') } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 } },
      React.createElement('span', { style: { width: 26, height: 26, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center',
        background: d.ok ? 'var(--ok-600)' : d.pick ? 'var(--bad-600)' : 'var(--ink-300)', color: '#fff' } },
        d.ok ? IconWrap('Check', { size: 16, stroke: 2.6 }) : d.pick ? IconWrap('X', { size: 16, stroke: 2.6 }) : IconWrap('Info', { size: 15 })),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
          React.createElement('span', { className: 'tag', style: { background: m.tint, color: m.color, fontSize: 11.5, padding: '2px 8px' } }, q.itemNum + ' ' + m.label),
          !d.pick && React.createElement('span', { className: 'tag', style: { background: 'var(--ink-100)', color: 'var(--ink-500)', fontSize: 11.5, padding: '2px 8px' } }, '未作答')),
        React.createElement('div', { style: { fontSize: 16.5, fontWeight: 600, color: 'var(--navy-900)', lineHeight: 1.6, textWrap: 'pretty' } }, q.q)),
      React.createElement('button', { onClick: () => toggleStar(d.id), title: '標記',
        style: { flex: 'none', color: starred ? 'var(--star-500)' : 'var(--ink-300)' } }, IconWrap(starred ? 'StarFill' : 'Star', { size: 20 }))),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, paddingLeft: 38 } },
      q.o.map((text, i) => {
        const opt = i + 1; const isA = opt === q.a; const isPick = opt === d.pick;
        const bg = isA ? 'var(--ok-50)' : isPick ? 'var(--bad-50)' : 'transparent';
        const bd = isA ? 'var(--ok-600)' : isPick ? 'var(--bad-600)' : 'var(--ink-200)';
        const co = isA ? 'var(--ok-700)' : isPick ? 'var(--bad-700)' : 'var(--ink-600)';
        return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
          borderRadius: 9, border: '1px solid ' + bd, background: bg } },
          React.createElement('span', { className: 'tnum', style: { fontWeight: 800, color: co, fontSize: 14 } }, OPT_LABELS[i]),
          React.createElement('span', { style: { fontSize: 14.5, color: co, fontWeight: isA || isPick ? 700 : 500, flex: 1 } }, text),
          isA && React.createElement('span', { style: { fontSize: 11.5, fontWeight: 800, color: 'var(--ok-700)' } }, '正解'),
          isPick && !isA && React.createElement('span', { style: { fontSize: 11.5, fontWeight: 800, color: 'var(--bad-700)' } }, '你的'));
      })),
    React.createElement('div', { style: { paddingLeft: 38, marginTop: 12 } },
      React.createElement('button', { onClick: () => setOpen(o => !o), style: { display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 13, fontWeight: 700, color: note ? 'var(--brand-600)' : 'var(--ink-500)' } },
        IconWrap('Pencil', { size: 14 }), note ? '我的解析筆記' : '加註解析', IconWrap(open ? 'Left' : 'Right', { size: 13 })),
      open && React.createElement('textarea', { defaultValue: note, onChange: e => setNote(d.id, e.target.value), rows: 2,
        placeholder: '加註記憶點或觀念…（自動儲存）',
        style: { width: '100%', marginTop: 9, resize: 'vertical', padding: '11px 13px', borderRadius: 9, border: '1px solid var(--ink-200)',
          fontSize: 14, background: 'var(--ink-50)', lineHeight: 1.6 } })));
}
