/* Aurora: only one pointer loop, only inside the visible hero. No external dependency. */
(() => {
  'use strict';
  const root=document.getElementById('uf-home');if(!root)return;
  const hero=root.querySelector('.aurora-hero'), header=root.querySelector('.site-header');
  const progress=root.querySelector('.aurora-progress'), reduced=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover:hover) and (pointer:fine)');
  const allowed=()=>fine.matches&&!reduced.matches&&!document.hidden&&!root.classList.contains('motion-paused');
  let frame=0, previous=0, x=.69,y=.42,p=0,tx=x,ty=y,tp=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const clear=()=>{cancelAnimationFrame(frame);frame=0;previous=0;tp=0;p=0;hero.style.removeProperty('--aurora-intensity');};
  function ensure(){if(!frame&&allowed()){previous=0;frame=requestAnimationFrame(tick);}}
  function tick(now){frame=0;if(!allowed()){clear();return;}const dt=previous?Math.min(50,now-previous):16;previous=now;const a=1-Math.exp(-dt/155);x+=(tx-x)*a;y+=(ty-y)*a;p+=(tp-p)*a;hero.style.setProperty('--aurora-x',`${(x*100).toFixed(2)}%`);hero.style.setProperty('--aurora-y',`${(y*100).toFixed(2)}%`);hero.style.setProperty('--aurora-intensity',p.toFixed(3));if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(tp-p)>.004)frame=requestAnimationFrame(tick);else if(tp===0)clear();}
  hero.addEventListener('pointermove',e=>{if(!allowed()||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();tx=clamp((e.clientX-r.left)/r.width);ty=clamp((e.clientY-r.top)/r.height);tp=1;ensure();},{passive:true});
  hero.addEventListener('pointerleave',()=>{tp=0;ensure();},{passive:true});
  hero.addEventListener('pointercancel',clear,{passive:true});
  window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  root.addEventListener('uf-motion-change',()=>{if(!allowed())clear();});fine.addEventListener?.('change',clear);reduced.addEventListener?.('change',clear);
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)clear();}).observe(hero);
  // Header reading progress is informational, not an auto-scrolling animation.
  let scrollFrame=0;function updateProgress(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--scroll-progress',clamp(max>0?scrollY/max:0).toFixed(4));header.classList.toggle('aurora-scrolled',scrollY>20);}
  function scheduleProgress(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress);}
  window.addEventListener('scroll',scheduleProgress,{passive:true});window.addEventListener('resize',scheduleProgress,{passive:true});updateProgress();
  // Hero market cards are real, keyboard-accessible controls for the existing market selector.
  root.querySelectorAll('[data-hero-market]').forEach(btn=>btn.addEventListener('click',()=>{
    const market=btn.dataset.heroMarket, tab=root.querySelector(`.market-tab[data-market="${market}"]`);if(!tab)return;
    tab.click();const section=root.querySelector('#markets');section.scrollIntoView({behavior:allowed()?'smooth':'auto',block:'start'});tab.focus({preventScroll:true});
  }));
})();
