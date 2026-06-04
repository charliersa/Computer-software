import React, { useState } from 'react';
import { IconWrap, Ring, Bar, ITEM_META, fmtTime } from './components';
import { TopBar, Modal } from './chrome';
import { PracticeLauncher, ExamIntro } from './launchers';
import { TOTAL_Q } from './data/quizData';

export function HomeScreen({ ctx }) {
  const { stats, store, startQuiz, setActive, go, patch } = ctx;
  const [modal, setModal] = useState(null);
  const active = store.active;
  const pct = v => Math.round(v * 100);

  const right = React.createElement(React.Fragment, null,
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px',
      background: 'var(--ink-100)', borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-500)' } },
      React.createElement('span', { className: 'tnum' }, TOTAL_Q), '題題庫 · v114'),
    React.createElement('button', { className: 'btn btn-ghost', style: { padding: '9px 13px' },
      onClick: () => { if (confirm('確定清除所有作答紀錄、星號與解析？此動作無法復原。')) { localStorage.removeItem('csa_c_quiz_v2'); location.reload(); } } },
      IconWrap('Trash', { size: 17 }), '重置'));

  return React.createElement('div', { style: { minHeight: '100vh', paddingBottom: 60 } },
    React.createElement(TopBar, { ctx, right, onBrand: () => go({ name: 'home' }) }),
    React.createElement('main', { className: 'shell fade-in', style: { paddingTop: 26 } },

      active && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 18,
        background: 'linear-gradient(100deg,#0b2545,#16456f)', color: '#fff', borderRadius: 'var(--r-lg)',
        padding: '18px 24px', marginBottom: 24, boxShadow: 'var(--sh-3)' } },
        React.createElement('div', { style: { width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,.13)',
          display: 'grid', placeItems: 'center', flex: 'none' } }, IconWrap(active.mode === 'exam' ? 'Trophy' : 'Sparkle', { size: 23 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontWeight: 800, fontSize: 16 } }, '有一場未完成的' + (active.mode === 'exam' ? '模擬考' : '練習')),
          React.createElement('div', { style: { fontSize: 13.5, opacity: .82, marginTop: 2 } },
            active.scopeLabel + ' · 進度 ' + Object.keys(active.answers).length + ' / ' + active.qIds.length + ' 題')),
        React.createElement('button', { className: 'btn', style: { background: 'rgba(255,255,255,.16)', color: '#fff' },
          onClick: () => patch(n => { n.active = null; }) }, '放棄'),
        React.createElement('button', { className: 'btn', style: { background: '#fff', color: 'var(--navy-900)' },
          onClick: () => go({ name: 'quiz' }) }, IconWrap('ArrowR', { size: 18 }), '繼續作答')),

      React.createElement('section', { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 24,
        alignItems: 'center', background: 'var(--paper)', border: '1px solid var(--ink-200)',
        borderRadius: 'var(--r-xl)', padding: '26px 30px', marginBottom: 24, boxShadow: 'var(--sh-1)' } },
        React.createElement('div', null,
          React.createElement('h1', { style: { margin: 0, fontSize: 25, fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '.2px' } }, '準備好了嗎？開始你的測驗'),
          React.createElement('p', { style: { margin: '7px 0 18px', color: 'var(--ink-500)', fontSize: 14.5, maxWidth: 560 } },
            '依勞動部技能檢定「電腦軟體應用 丙級」學科參考題庫，涵蓋四大工作項目共 ' + TOTAL_Q + ' 題。'),
          React.createElement('div', { style: { display: 'flex', gap: 34, flexWrap: 'wrap' } },
            [['累計作答', stats.answered], ['正確率', pct(stats.accuracy) + '%'], ['待複習', stats.wrongIds.length], ['已標記', stats.starredIds.length]].map((s, i) =>
              React.createElement('div', { key: i },
                React.createElement('div', { className: 'tnum', style: { fontSize: 27, fontWeight: 800,
                  color: i === 1 && stats.answered ? (stats.accuracy >= .6 ? 'var(--ok-600)' : 'var(--bad-600)') : 'var(--navy-800)' } }, s[1]),
                React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 600, marginTop: 1 } }, s[0]))))),
        React.createElement(Ring, { value: stats.coverage, size: 118, stroke: 12, color: 'var(--brand-600)' },
          React.createElement('div', { className: 'tnum', style: { fontSize: 25, fontWeight: 800, color: 'var(--navy-900)' } }, pct(stats.coverage) + '%'),
          React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 600 } }, '題庫涵蓋'))),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 } },
        ModeCard({ featured: true, icon: 'Trophy', title: '模擬考', desc: '80 題 · 60 分鐘 · 仿真計分',
          meta: '時間到自動交卷', onClick: () => setModal('exam') }),
        ModeCard({ icon: 'Sparkle', accent: 'var(--brand-600)', tint: 'var(--brand-50)', title: '練習模式',
          desc: '作答後立即顯示對錯與解析', meta: '自選範圍與題數', onClick: () => setModal('practice') }),
        ModeCard({ icon: 'Layers', accent: '#7a3ea8', tint: '#f3ecfb', title: '分類練習',
          desc: '依四大工作項目分項練習', meta: '針對弱項加強', onClick: () => setModal('category') }),
        ModeCard({ icon: 'Redo', accent: 'var(--bad-600)', tint: 'var(--bad-50)', title: '錯題複習',
          desc: '重新練習答錯過的題目', meta: stats.wrongIds.length ? stats.wrongIds.length + ' 題待複習' : '目前沒有錯題',
          disabled: stats.wrongIds.length === 0,
          onClick: () => stats.wrongIds.length && startQuiz({ mode: 'practice', scope: { type: 'wrong' }, count: Math.min(stats.wrongIds.length, 9999), order: 'random', scopeLabel: '錯題複習' }) })),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18 } },
        ItemProgress({ ctx, onPick: (num) => setModal({ type: 'item', item: num }) }),
        RecentPanel({ ctx }))),

    React.createElement(Modal, { open: modal === 'practice', onClose: () => setModal(null), width: 560, label: '練習設定' },
      React.createElement(PracticeLauncher, { ctx, onClose: () => setModal(null) })),
    React.createElement(Modal, { open: modal && modal.type === 'item', onClose: () => setModal(null), width: 560, label: '分類練習' },
      React.createElement(PracticeLauncher, { ctx, initial: modal && modal.type === 'item' ? modal : null, onClose: () => setModal(null) })),
    React.createElement(Modal, { open: modal === 'category', onClose: () => setModal(null), width: 560, label: '分類練習' },
      React.createElement(PracticeLauncher, { ctx, initial: { type: 'item', item: '01' }, onClose: () => setModal(null) })),
    React.createElement(Modal, { open: modal === 'exam', onClose: () => setModal(null), width: 480, label: '模擬考' },
      React.createElement(ExamIntro, { ctx, onClose: () => setModal(null) })));
}

function ModeCard({ featured, icon, title, desc, meta, onClick, disabled, accent, tint }) {
  const base = { textAlign: 'left', width: '100%', borderRadius: 'var(--r-lg)', padding: '24px 26px',
    display: 'flex', flexDirection: 'column', gap: 0, minHeight: 172, position: 'relative', overflow: 'hidden',
    transition: 'transform .12s ease, box-shadow .18s ease, border-color .15s',
    opacity: disabled ? .55 : 1, cursor: disabled ? 'not-allowed' : 'pointer' };
  const style = featured
    ? { ...base, background: 'linear-gradient(155deg,#16456f,#0b2545)', color: '#fff', boxShadow: 'var(--sh-3)', border: '1px solid transparent' }
    : { ...base, background: 'var(--paper)', border: '1px solid var(--ink-200)', boxShadow: 'var(--sh-1)', color: 'var(--ink-800)' };
  return React.createElement('button', { onClick: disabled ? undefined : onClick, style,
    onMouseEnter: e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh-3)'; if (!featured) e.currentTarget.style.borderColor = accent; } },
    onMouseLeave: e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = featured ? 'var(--sh-3)' : 'var(--sh-1)'; if (!featured) e.currentTarget.style.borderColor = 'var(--ink-200)'; } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
      React.createElement('div', { style: { width: 48, height: 48, borderRadius: 13,
        background: featured ? 'rgba(255,255,255,.14)' : tint, color: featured ? '#fff' : accent,
        display: 'grid', placeItems: 'center' } }, IconWrap(icon, { size: 26 })),
      React.createElement('div', { style: { color: featured ? 'rgba(255,255,255,.7)' : 'var(--ink-300)' } }, IconWrap('Right', { size: 22 }))),
    React.createElement('div', { style: { fontSize: 21, fontWeight: 800, marginTop: 18, letterSpacing: '.3px',
      color: featured ? '#fff' : 'var(--navy-900)' } }, title),
    React.createElement('div', { style: { fontSize: 14, marginTop: 5, color: featured ? 'rgba(255,255,255,.82)' : 'var(--ink-500)' } }, desc),
    React.createElement('div', { style: { marginTop: 'auto', paddingTop: 14, fontSize: 12.5, fontWeight: 700, letterSpacing: '.3px',
      color: featured ? 'rgba(255,255,255,.7)' : 'var(--ink-400)' } }, meta));
}

function ItemProgress({ ctx, onPick }) {
  const { stats, DATA } = ctx;
  return React.createElement('div', { className: 'card', style: { padding: '22px 24px' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 } },
      IconWrap('Chart', { size: 19, stroke: 2.2 }),
      React.createElement('h3', { style: { margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy-900)' } }, '工作項目進度')),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
      DATA.items.map(it => {
        const m = ITEM_META[it.num]; const p = stats.perItem[it.num];
        return React.createElement('button', { key: it.num, onClick: () => onPick(it.num),
          style: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px', borderRadius: 11,
            background: 'transparent', transition: 'background .12s', textAlign: 'left' },
          onMouseEnter: e => e.currentTarget.style.background = 'var(--ink-50)',
          onMouseLeave: e => e.currentTarget.style.background = 'transparent' },
          React.createElement('span', { style: { width: 38, height: 38, borderRadius: 10, background: m.tint, color: m.color,
            display: 'grid', placeItems: 'center', flex: 'none' } }, IconWrap(m.icon, { size: 20 })),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
              React.createElement('span', { style: { fontWeight: 700, fontSize: 14.5, color: 'var(--navy-900)' } }, it.num + '　' + m.label),
              React.createElement('span', { className: 'tnum', style: { fontSize: 13, color: 'var(--ink-500)', fontWeight: 600 } }, p.seen + ' / ' + p.total)),
            React.createElement(Bar, { value: p.seen / p.total, color: m.color, h: 7 })),
          React.createElement('span', { style: { color: 'var(--ink-300)' } }, IconWrap('Right', { size: 18 })));
      })));
}

function RecentPanel({ ctx }) {
  const sessions = (ctx.store.sessions || []).filter(s => s.mode === 'exam').slice(0, 4);
  return React.createElement('div', { className: 'card', style: { padding: '22px 24px' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 } },
      IconWrap('Trophy', { size: 19, stroke: 2.2 }),
      React.createElement('h3', { style: { margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--navy-900)' } }, '最近模擬考')),
    sessions.length === 0
      ? React.createElement('div', { style: { padding: '24px 0', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13.5 } },
          IconWrap('Info', { size: 26 }),
          React.createElement('div', { style: { marginTop: 8 } }, '尚無模擬考紀錄'),
          React.createElement('div', { style: { fontSize: 12.5, marginTop: 2 } }, '完成一場模擬考後會顯示在這裡'))
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          sessions.map((s, i) => {
            const pc = Math.round(s.correct / s.total * 100); const pass = pc >= 60;
            return React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 13,
              padding: '10px 12px', borderRadius: 11, background: 'var(--ink-50)' } },
              React.createElement('div', { style: { width: 42, height: 42, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center',
                background: pass ? 'var(--ok-100)' : 'var(--bad-100)', color: pass ? 'var(--ok-700)' : 'var(--bad-700)',
                fontWeight: 800, fontSize: 14 } }, React.createElement('span', { className: 'tnum' }, pc)),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { style: { fontWeight: 700, fontSize: 14, color: 'var(--navy-900)' } },
                  React.createElement('span', { className: 'tnum' }, s.correct), ' / ', React.createElement('span', { className: 'tnum' }, s.total), ' 題',
                  React.createElement('span', { className: 'tag', style: { marginLeft: 8, fontSize: 11.5, padding: '2px 8px',
                    background: pass ? 'var(--ok-50)' : 'var(--bad-50)', color: pass ? 'var(--ok-700)' : 'var(--bad-700)' } }, pass ? '及格' : '未達標')),
                React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-500)', marginTop: 1 } },
                  new Date(s.ts).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' · 用時 ' + fmtTime(s.dur))));
          })));
}
