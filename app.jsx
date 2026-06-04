/* ============================================================
   App root — store, persistence, routing.
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const KEY = 'csa_c_quiz_v2';

/* ----- data helpers ----- */
const DATA = window.QUIZ_DATA;
const ALL_Q = [];
const Q_BY_ID = {};
DATA.items.forEach(it => it.questions.forEach(q => {
  const obj = { ...q, itemNum: it.num, itemTitle: it.title };
  ALL_Q.push(obj); Q_BY_ID[q.id] = obj;
}));
const TOTAL_Q = ALL_Q.length;

function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function loadStore(){
  try { const s = JSON.parse(localStorage.getItem(KEY)); if(s && typeof s==='object') return s; } catch(e){}
  return { perQ:{}, starred:{}, notes:{}, sessions:[], active:null };
}

/* ----- root ----- */
function App(){
  const [store, setStore] = useState(loadStore);
  const [view, setView] = useState(()=> ({ name:'home' }));

  // persist
  useEffect(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }, [store]);

  const patch = useCallback((fn)=> setStore(s=>{ const n={...s}; fn(n); return n; }), []);

  /* derived stats */
  const stats = useMemo(()=>{
    const perQ = store.perQ||{};
    const ids = Object.keys(perQ);
    let seen=ids.length, answered=0, correct=0;
    ids.forEach(id=>{ const r=perQ[id]; answered+=(r.ok+r.no); correct+=r.ok; });
    const wrong = ids.filter(id=>{ const r=perQ[id]; return r.no>0 && r.lastWrong; });
    const starred = Object.keys(store.starred||{}).filter(k=>store.starred[k]);
    const perItem = {};
    DATA.items.forEach(it=>{
      const qs = it.questions;
      const seenIds = qs.filter(q=>perQ[q.id]&&perQ[q.id].seen).length;
      const okIds = qs.filter(q=>perQ[q.id]&&perQ[q.id].ok>0).length;
      perItem[it.num] = { total: qs.length, seen: seenIds, mastered: okIds };
    });
    return { seen, answered, correct,
      accuracy: answered? correct/answered : 0,
      coverage: seen/TOTAL_Q,
      wrongIds: wrong, starredIds: starred, perItem };
  }, [store]);

  /* ----- record an answer (updates perQ + wrong/correct membership) ----- */
  const recordAnswer = useCallback((q, pick)=>{
    patch(n=>{
      n.perQ = {...n.perQ};
      const cur = n.perQ[q.id] ? {...n.perQ[q.id]} : { seen:0, ok:0, no:0 };
      cur.seen += 1;
      const ok = pick === q.a;
      if(ok){ cur.ok += 1; cur.lastWrong = false; }
      else { cur.no += 1; cur.lastWrong = true; }
      n.perQ[q.id] = cur;
    });
  }, [patch]);

  const toggleStar = useCallback((id)=> patch(n=>{ n.starred={...n.starred}; if(n.starred[id]) delete n.starred[id]; else n.starred[id]=1; }), [patch]);
  const setNote = useCallback((id, text)=> patch(n=>{ n.notes={...n.notes}; if(text&&text.trim()) n.notes[id]=text; else delete n.notes[id]; }), [patch]);
  const setActive = useCallback((sess)=> patch(n=>{ n.active = sess; }), [patch]);
  const finishSession = useCallback((summary)=> patch(n=>{
    n.active=null; n.sessions=[summary, ...(n.sessions||[])].slice(0,40);
  }), [patch]);

  /* ----- build a quiz pool & start ----- */
  const startQuiz = useCallback((cfg)=>{
    // cfg: {mode, scope:{type,item}, count, order, timeLimit, scopeLabel}
    let pool;
    const { scope } = cfg;
    if(scope.type==='item') pool = DATA.items.find(i=>i.num===scope.item).questions.map(q=>Q_BY_ID[q.id]);
    else if(scope.type==='star') pool = stats.starredIds.map(id=>Q_BY_ID[id]).filter(Boolean);
    else if(scope.type==='wrong') pool = stats.wrongIds.map(id=>Q_BY_ID[id]).filter(Boolean);
    else pool = ALL_Q.slice();
    if(cfg.order!=='seq') pool = shuffle(pool);
    if(cfg.count && cfg.count < pool.length) pool = pool.slice(0, cfg.count);
    const sess = {
      mode: cfg.mode, immediate: cfg.mode!=='exam',
      scopeLabel: cfg.scopeLabel,
      qIds: pool.map(q=>q.id),
      idx:0, answers:{}, locked:{},
      startTs: Date.now(),
      timeLimit: cfg.timeLimit||null,
    };
    setActive(sess);
    setView({ name:'quiz' });
  }, [stats, setActive]);

  const go = useCallback((v)=>setView(v),[]);

  const ctx = { store, stats, patch, recordAnswer, toggleStar, setNote, setActive, finishSession, startQuiz, go,
    Q_BY_ID, ALL_Q, TOTAL_Q, DATA };

  let screen;
  if(view.name==='quiz') screen = React.createElement(window.QuizScreen,{ctx, key:'quiz'});
  else if(view.name==='result') screen = React.createElement(window.ResultScreen,{ctx, payload:view.payload, key:'res'});
  else screen = React.createElement(window.HomeScreen,{ctx, key:'home'});
  return screen;
}

window.startReactApp = function(){
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
};
window.__quizHelpers = { shuffle, ALL_Q, Q_BY_ID, TOTAL_Q };
