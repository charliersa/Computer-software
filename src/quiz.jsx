import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { IconWrap, Bar, ITEM_META, fmtTime } from './components';
import { Modal, Key } from './chrome';
import { QuestionCard, Palette } from './quiz_parts';
import { Q_BY_ID } from './data/quizData';

export function QuizScreen({ ctx }) {
  const { store, patch, recordAnswer, toggleStar, setNote, finishSession, go } = ctx;
  const sess = store.active;
  if (!sess) {
    return React.createElement('div', { style: { padding: 60, textAlign: 'center' } }, '沒有進行中的測驗。',
      React.createElement('div', { style: { marginTop: 16 } },
        React.createElement('button', { className: 'btn btn-primary', onClick: () => go({ name: 'home' }) }, '回首頁')));
  }

  const exam = sess.mode === 'exam';
  const questions = useMemo(() => sess.qIds.map(id => Q_BY_ID[id]), [sess.qIds]);
  const N = questions.length;

  const [idx, setIdx] = useState(sess.idx || 0);
  const [answers, setAnswers] = useState(sess.answers || {});
  const [locked, setLocked] = useState(sess.locked || {});
  const [now, setNow] = useState(Date.now());
  const submittedRef = useRef(false);

  const q = questions[idx];
  const pick = answers[q.id];
  const isLocked = !!locked[q.id];

  useEffect(() => { patch(n => { if (n.active) n.active = { ...n.active, idx, answers, locked }; }); }, [idx, answers, locked]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);

  const elapsed = (now - sess.startTs) / 1000;
  const remaining = sess.timeLimit ? Math.max(0, sess.timeLimit - elapsed) : null;

  const doSubmit = useCallback((auto) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    let correct = 0; const details = [];
    questions.forEach(qq => {
      const p = answers[qq.id];
      const ok = p === qq.a;
      if (ok) correct++;
      if (exam && p) recordAnswer(qq, p);
      details.push({ id: qq.id, pick: p || null, a: qq.a, ok, itemNum: qq.itemNum });
    });
    const summary = { mode: sess.mode, scopeLabel: sess.scopeLabel, total: N, correct,
      answered: Object.keys(answers).length, ts: Date.now(), dur: Math.round(elapsed),
      details, auto: !!auto };
    finishSession(summary);
    go({ name: 'result', payload: summary });
  }, [answers, questions, elapsed, N]);

  useEffect(() => { if (remaining !== null && remaining <= 0 && !submittedRef.current) doSubmit(true); }, [remaining]);

  const choose = (n) => {
    if (exam) { setAnswers(a => ({ ...a, [q.id]: n })); }
    else {
      if (isLocked) return;
      setAnswers(a => ({ ...a, [q.id]: n }));
      setLocked(l => ({ ...l, [q.id]: true }));
      recordAnswer(q, n);
    }
  };
  const next = () => { if (idx < N - 1) setIdx(idx + 1); else if (exam) confirmSubmit(); else doSubmit(false); };
  const prev = () => idx > 0 && setIdx(idx - 1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmSubmit = () => setConfirmOpen(true);

  useEffect(() => {
    const h = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea' || tag === 'input') return;
      if (['1', '2', '3', '4'].includes(e.key)) { e.preventDefault(); choose(+e.key); }
      else if (e.key === 'Enter') { e.preventDefault(); if (exam) next(); else if (isLocked) next(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (exam) next(); else if (isLocked) next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (exam) prev(); }
      else if (e.key.toLowerCase() === 's') { e.preventDefault(); toggleStar(q.id); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [idx, answers, locked, isLocked, pick]);

  const answeredCount = Object.keys(answers).length;
  const starred = !!store.starred[q.id];
  const m = ITEM_META[q.itemNum];

  return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink-100)' } },
    React.createElement('header', { style: { position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.9)',
      backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--ink-200)' } },
      React.createElement('div', { style: { maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 62,
        display: 'flex', alignItems: 'center', gap: 20 } },
        React.createElement('button', { className: 'btn btn-quiet', style: { padding: '8px 12px' },
          onClick: () => exam ? confirmSubmit() : (confirm('結束本次練習並查看結果？') && doSubmit(false)) },
          IconWrap('Left', { size: 18 }), exam ? '交卷' : '結束'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          React.createElement('span', { className: 'tag', style: { background: exam ? 'var(--navy-800)' : m.tint,
            color: exam ? '#fff' : m.color } }, exam ? IconWrap('Trophy', { size: 14 }) : IconWrap(m.icon, { size: 14 }),
            exam ? '模擬考' : sess.scopeLabel)),
        React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 14, maxWidth: 520 } },
          React.createElement('span', { className: 'tnum', style: { fontSize: 14, fontWeight: 700, color: 'var(--ink-600)', whiteSpace: 'nowrap' } },
            React.createElement('b', { style: { color: 'var(--navy-900)', fontSize: 16 } }, idx + 1), ' / ' + N),
          React.createElement('div', { style: { flex: 1 } }, React.createElement(Bar, { value: (idx + 1) / N, color: 'var(--brand-600)', h: 7 }))),
        React.createElement(Timer, { exam, remaining, elapsed }),
        exam && React.createElement('button', { className: 'btn btn-dark', style: { padding: '10px 18px' }, onClick: confirmSubmit },
          IconWrap('Flag', { size: 16 }), '交卷'))),

    React.createElement('div', { style: { flex: 1, maxWidth: 1240, width: '100%', margin: '0 auto', padding: '28px 24px 90px',
      display: 'grid', gridTemplateColumns: exam ? '1fr 268px' : '1fr', gap: 24, alignItems: 'start' } },
      React.createElement('div', { key: q.id, className: 'fade-in', style: { maxWidth: exam ? 'none' : 760, margin: exam ? 0 : '0 auto', width: '100%' } },
        React.createElement(QuestionCard, { q, m, idx, exam, pick, isLocked, starred, onChoose: choose,
          onStar: () => toggleStar(q.id), note: store.notes[q.id] || '', onNote: (t) => setNote(q.id, t) }),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 } },
          React.createElement('button', { className: 'btn btn-ghost', disabled: !exam || idx === 0, onClick: prev,
            style: { visibility: exam ? 'visible' : 'hidden' } }, IconWrap('Left', { size: 18 }), '上一題'),
          React.createElement('div', { style: { display: 'flex', gap: 11, alignItems: 'center' } },
            React.createElement(ShortcutHint, null),
            idx < N - 1
              ? React.createElement('button', { className: 'btn btn-primary btn-lg', disabled: !exam && !isLocked, onClick: next },
                  '下一題', IconWrap('Right', { size: 18 }))
              : React.createElement('button', { className: 'btn btn-dark btn-lg', disabled: !exam && !isLocked,
                  onClick: () => exam ? confirmSubmit() : doSubmit(false) }, IconWrap('Flag', { size: 17 }), '完成作答')))),
      exam && React.createElement(Palette, { ctx, questions, answers, idx, setIdx, answered: answeredCount, onSubmit: confirmSubmit })),

    React.createElement(Modal, { open: confirmOpen, onClose: () => setConfirmOpen(false), width: 440, label: '交卷確認' },
      React.createElement('div', { style: { padding: '30px 32px' } },
        React.createElement('h2', { style: { margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--navy-900)' } }, '確定要交卷嗎？'),
        React.createElement('p', { style: { margin: 0, color: 'var(--ink-500)', fontSize: 14.5, lineHeight: 1.7 } },
          '已作答 ', React.createElement('b', { className: 'tnum', style: { color: 'var(--navy-900)' } }, answeredCount), ' / ', N, ' 題。',
          answeredCount < N ? React.createElement('span', { style: { color: 'var(--bad-600)' } }, '尚有 ' + (N - answeredCount) + ' 題未作答。') : '交卷後將立即計分。'),
        React.createElement('div', { style: { display: 'flex', gap: 11, justifyContent: 'flex-end', marginTop: 26 } },
          React.createElement('button', { className: 'btn btn-quiet', onClick: () => setConfirmOpen(false) }, '再檢查一下'),
          React.createElement('button', { className: 'btn btn-dark', onClick: () => { setConfirmOpen(false); doSubmit(false); } }, '確定交卷')))));
}

function Timer({ exam, remaining, elapsed }) {
  if (exam) {
    const low = remaining <= 300;
    return React.createElement('div', { className: 'tag tnum', style: { fontSize: 15, padding: '8px 14px', gap: 7,
      background: low ? 'var(--bad-50)' : 'var(--ink-100)', color: low ? 'var(--bad-700)' : 'var(--ink-700)',
      border: '1px solid ' + (low ? 'var(--bad-100)' : 'var(--ink-200)') } },
      IconWrap('Clock', { size: 16 }), fmtTime(remaining));
  }
  return React.createElement('div', { className: 'tag tnum', style: { fontSize: 14, padding: '8px 13px', gap: 7,
    background: 'var(--ink-100)', color: 'var(--ink-500)' } },
    IconWrap('Clock', { size: 15 }), fmtTime(elapsed));
}

function ShortcutHint() {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginRight: 6,
    fontSize: 12.5, color: 'var(--ink-400)', fontWeight: 600 } },
    React.createElement(Key, null, '1'), React.createElement(Key, null, '4'),
    React.createElement('span', { style: { margin: '0 1px' } }, '選項'),
    React.createElement(Key, null, '↵'), React.createElement('span', null, '下一題'));
}
