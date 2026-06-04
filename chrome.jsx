/* Shared chrome: brand TopBar + Modal shell */
const { useEffect: useEff_c } = React;

function Brand({small}){
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12}},
    React.createElement('div',{style:{width:small?34:40,height:small?34:40,borderRadius:10,
      background:'linear-gradient(150deg,var(--navy-700),var(--navy-900))',color:'#fff',
      display:'grid',placeItems:'center',boxShadow:'var(--sh-2)',flex:'none'}},
      React.createElement('svg',{width:small?20:23,height:small?20:23,viewBox:'0 0 24 24',fill:'none',
        stroke:'#fff',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
        React.createElement('path',{d:'M4 5h16v11H4z'}),
        React.createElement('path',{d:'M2 20h20'}),
        React.createElement('path',{d:'m8.5 9 2 2-2 2'}),
        React.createElement('path',{d:'M13 13h3'}))),
    React.createElement('div',{style:{lineHeight:1.15}},
      React.createElement('div',{style:{fontWeight:800,fontSize:small?15:16.5,color:'var(--navy-900)',letterSpacing:'.2px'}},'電腦軟體應用 ',
        React.createElement('span',{style:{color:'var(--brand-600)'}},'丙級')),
      React.createElement('div',{style:{fontSize:11.5,color:'var(--ink-500)',fontWeight:600,letterSpacing:'.6px'}},'學科線上測驗系統')));
}

function TopBar({ctx, right, onBrand}){
  return React.createElement('header',{style:{position:'sticky',top:0,zIndex:30,
    background:'rgba(255,255,255,.86)',backdropFilter:'blur(10px)',
    borderBottom:'1px solid var(--ink-200)'}},
    React.createElement('div',{className:'shell',style:{height:66,display:'flex',
      alignItems:'center',justifyContent:'space-between'}},
      React.createElement('button',{onClick:onBrand,style:{background:'none'}}, React.createElement(Brand,{})),
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10}}, right)));
}

function Modal({open, onClose, children, width=560, label}){
  useEff_c(()=>{
    if(!open) return;
    const h=(e)=>{ if(e.key==='Escape') onClose&&onClose(); };
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h);
  },[open,onClose]);
  if(!open) return null;
  return React.createElement('div',{onMouseDown:onClose,style:{position:'fixed',inset:0,zIndex:60,
    background:'rgba(11,37,69,.34)',backdropFilter:'blur(3px)',display:'grid',placeItems:'center',padding:24,
    animation:'fade .18s ease'}},
    React.createElement('div',{role:'dialog','aria-label':label,onMouseDown:e=>e.stopPropagation(),
      style:{width:'min('+width+'px,100%)',maxHeight:'90vh',overflow:'auto',background:'var(--paper)',
        borderRadius:'var(--r-xl)',boxShadow:'var(--sh-pop)',animation:'pop .22s cubic-bezier(.2,.9,.3,1.2)'}}, children));
}

/* keycap */
function Key({children}){
  return React.createElement('kbd',{className:'mono',style:{display:'inline-grid',placeItems:'center',
    minWidth:22,height:22,padding:'0 5px',fontSize:12,fontWeight:600,color:'var(--ink-700)',
    background:'var(--paper)',border:'1px solid var(--ink-300)',borderBottomWidth:2,borderRadius:6,
    boxShadow:'0 1px 0 rgba(0,0,0,.02)'}}, children);
}

Object.assign(window,{ Brand, TopBar, Modal, Key });
