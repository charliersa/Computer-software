import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DATA, ALL_Q, Q_BY_ID, TOTAL_Q, shuffle } from './data/quizData';
import { HomeScreen } from './home';
import { QuizScreen } from './quiz';
import { ResultScreen } from './results';

const KEY = 'csa_c_quiz_v2';

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') return s;
  } catch (e) {}
  return { perQ: {}, starred: {}, notes: {}, sessions: [], active: null };
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [view, setView] = useState(() => ({ name: 'home' }));

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }, [store]);

  const patch = useCallback((fn) => setStore(s => { const n = { ...s }; fn(n); return n; }), []);

  const stats = useMemo(() => {
    const perQ = store.perQ || {};
    const ids = Object.keys(perQ);
    let seen = ids.length, answered = 0, correct = 0;
    ids.forEach(id => { const r = perQ[id]; answered += (r.ok + r.no); correct += r.ok; });
    const wrong = ids.filter(id => { const r = perQ[id]; return r.no > 0 && r.lastWrong; });
    const starred = Object.keys(store.starred || {}).filter(k => store.starred[k]);
    const perItem = {};
    DATA.items.forEach(it => {
      const qs = it.questions;
      const seenIds = qs.filter(q => perQ[q.id] && perQ[q.id].seen).length;
      const okIds = qs.filter(q => perQ[q.id] && perQ[q.id].ok > 0).length;
      perItem[it.num] = { total: qs.length, seen: seenIds, mastered: okIds };
    });
    return { seen, answered, correct,
      accuracy: answered ? correct / answered : 0,
      coverage: seen / TOTAL_Q,
      wrongIds: wrong, starredIds: starred, perItem };
  }, [store]);

  const recordAnswer = useCallback((q, pick) => {
    patch(n => {
      n.perQ = { ...n.perQ };
      const cur = n.perQ[q.id] ? { ...n.perQ[q.id] } : { seen: 0, ok: 0, no: 0 };
      cur.seen += 1;
      const ok = pick === q.a;
      if (ok) { cur.ok += 1; cur.lastWrong = false; }
      else { cur.no += 1; cur.lastWrong = true; }
      n.perQ[q.id] = cur;
    });
  }, [patch]);

  const toggleStar = useCallback((id) => patch(n => { n.starred = { ...n.starred }; if (n.starred[id]) delete n.starred[id]; else n.starred[id] = 1; }), [patch]);
  const setNote = useCallback((id, text) => patch(n => { n.notes = { ...n.notes }; if (text && text.trim()) n.notes[id] = text; else delete n.notes[id]; }), [patch]);
  const setActive = useCallback((sess) => patch(n => { n.active = sess; }), [patch]);
  const finishSession = useCallback((summary) => patch(n => { n.active = null; n.sessions = [summary, ...(n.sessions || [])].slice(0, 40); }), [patch]);

  const startQuiz = useCallback((cfg) => {
    let pool;
    const { scope } = cfg;
    if (scope.type === 'item') pool = DATA.items.find(i => i.num === scope.item).questions.map(q => Q_BY_ID[q.id]);
    else if (scope.type === 'star') pool = stats.starredIds.map(id => Q_BY_ID[id]).filter(Boolean);
    else if (scope.type === 'wrong') pool = stats.wrongIds.map(id => Q_BY_ID[id]).filter(Boolean);
    else pool = ALL_Q.slice();
    if (cfg.order !== 'seq') pool = shuffle(pool);
    if (cfg.count && cfg.count < pool.length) pool = pool.slice(0, cfg.count);
    const sess = {
      mode: cfg.mode, immediate: cfg.mode !== 'exam',
      scopeLabel: cfg.scopeLabel,
      qIds: pool.map(q => q.id),
      idx: 0, answers: {}, locked: {},
      startTs: Date.now(),
      timeLimit: cfg.timeLimit || null,
    };
    setActive(sess);
    setView({ name: 'quiz' });
  }, [stats, setActive]);

  const go = useCallback((v) => setView(v), []);

  const ctx = { store, stats, patch, recordAnswer, toggleStar, setNote, setActive, finishSession, startQuiz, go,
    Q_BY_ID, ALL_Q, TOTAL_Q, DATA };

  if (view.name === 'quiz') return React.createElement(QuizScreen, { ctx, key: 'quiz' });
  if (view.name === 'result') return React.createElement(ResultScreen, { ctx, payload: view.payload, key: 'res' });
  return React.createElement(HomeScreen, { ctx, key: 'home' });
}
