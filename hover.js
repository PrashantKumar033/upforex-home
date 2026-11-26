/** UPFOREX Vision: pointer-responsive motion, with one event-driven RAF loop.
 * Fine pointers only. No layout changes, listeners on individual cards, or external dependency.
 */
(() => {
  'use strict';
  const root = document.getElementById('uf-home');
  if (!root) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cardSelector = '.account-card,.feature-card,.review-card,.footer-reg-card,.stat-item,.advantage-item';
  const surfaceSelector = `${cardSelector},.cta-panel,.footer-trust-strip,.footer-trust-panel,.footer-link-group,.client-review-shell,.journal-topic-strip,.stats-panel,.market-tab,.platform-pill`;
  const visualSelector = '.platform-stage,.hero-visual,.partner-art';
  const selector = `${surfaceSelector},${visualSelector},.button,.footer-social-link,.footer-back,.atlas-market`;
  const states = new Map();
  let frame = 0;
  let previous = 0;
  let active = new Set();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const allowed = () => fine.matches && !reduced.matches && !document.hidden && !root.classList.contains('motion-paused');
  const properties = ['--hx','--hy','--hover-lift','--hover-axis-x','--hover-axis-y','--hover-angle','--hover-device-x','--hover-device-y','--hover-button-x','--hover-button-y','--resource-dx','--resource-dy'];
  function reset(el) {
    el.classList.remove('hover-active');
    properties.forEach(p => el.style.removeProperty(p));
  }
  function clearNow() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    states.forEach((_, el) => reset(el));
    states.clear(); active.clear();
  }
  function ensureFrame() { if (!frame && states.size && allowed()) { previous = 0; frame = requestAnimationFrame(tick); } }
  function stateFor(el) {
    let s = states.get(el);
    if (s) return s;
    const card = el.matches(cardSelector), light = el.matches(surfaceSelector), visual = el.matches(visualSelector), button = el.matches('.button,.footer-social-link,.footer-back,.atlas-market');
    if (light && !el.querySelector(':scope > .hover-light')) {
      const layer = document.createElement('span');
      layer.className = 'hover-light'; layer.setAttribute('aria-hidden','true'); el.append(layer);
    }
    if (light) el.classList.add('hover-surface');
    s = { card, light, visual, button, x:0,y:0,p:0,tx:0,ty:0,tp:0,rect:el.getBoundingClientRect() };
    states.set(el,s); return s;
  }
  function release(el) {
    const s=states.get(el); if (!s) return;
    s.tx=0;s.ty=0;s.tp=0;el.classList.remove('hover-active');
  }
  function exitAll() { active.forEach(release);active.clear();ensureFrame(); }
  function pointer(event) {
    if (!allowed() || event.pointerType !== 'mouse') { if (states.size) clearNow(); return; }
    if (!(event.target instanceof Element)) return;
    const next=new Set();
    // A button may be nested in the CTA. Track the button and its visual parent independently.
    for (let el=event.target.closest(selector);el && root.contains(el);el=el.parentElement?.closest(selector)) {
      next.add(el);
      const s=stateFor(el);
      if (!active.has(el)) {
        s.rect=el.getBoundingClientRect();
        el.classList.add('hover-active');
      }
      if (s.rect.width<1 || s.rect.height<1) continue;
      s.tx=clamp((event.clientX-s.rect.left)/s.rect.width*2-1,-1,1);
      s.ty=clamp((event.clientY-s.rect.top)/s.rect.height*2-1,-1,1);
      s.tp=1;
    }
    active.forEach(el=>{if(!next.has(el)) release(el);});
    active=next;
    ensureFrame();
  }
  function tick(now) {
    frame=0;
    if (!allowed()) {clearNow();return;}
    const dt=previous?Math.min(50,now-previous):16.7;previous=now;
    const a=1-Math.exp(-dt/120); // approximately 300 ms to settle, independent of frame rate
    let moving=false;
    states.forEach((s,el)=>{
      if (!el.isConnected) {states.delete(el);active.delete(el);return;}
      s.x+=(s.tx-s.x)*a;s.y+=(s.ty-s.y)*a;s.p+=(s.tp-s.p)*a;
      const settled=Math.abs(s.tx-s.x)+Math.abs(s.ty-s.y)+Math.abs(s.tp-s.p)<.006;
      if(settled){s.x=s.tx;s.y=s.ty;s.p=s.tp;}
      if (s.tp===0 && settled) {reset(el);states.delete(el);return;}
      const {x,y,p}=s;
      if (s.light) {el.style.setProperty('--hx',`${(50+50*x).toFixed(2)}%`);el.style.setProperty('--hy',`${(50+50*y).toFixed(2)}%`);}
      if (s.card || s.visual) {
        const max=s.card?(el.matches('.footer-reg-card,.stat-item,.advantage-item')?1.6:el.matches('.review-card')?3.3:5.4):el.matches('.platform-stage')?3.0:0;
        const rx=-y*max,ry=x*max,angle=Math.hypot(rx,ry);
        el.style.setProperty('--hover-axis-x',angle?(rx/angle).toFixed(4):'0');
        el.style.setProperty('--hover-axis-y',angle?(ry/angle).toFixed(4):'1');
        el.style.setProperty('--hover-angle',`${angle.toFixed(3)}deg`);
      }
      if (s.card && el.closest('.resource-expanded')) {
        el.style.setProperty('--resource-dx', `${(x*10*p).toFixed(2)}px`);
        el.style.setProperty('--resource-dy', `${(y*7*p).toFixed(2)}px`);
      }
      if (s.card) el.style.setProperty('--hover-lift',`${((el.matches('.footer-reg-card,.stat-item,.advantage-item')?-3:-8)*p).toFixed(2)}px`);
      if (s.visual) {const m=el.matches('.partner-art')?6:12;el.style.setProperty('--hover-device-x',`${(x*m).toFixed(2)}px`);el.style.setProperty('--hover-device-y',`${(y*m*.75).toFixed(2)}px`);}
      if(s.button){el.style.setProperty('--hover-button-x',`${(x*3.5).toFixed(2)}px`);el.style.setProperty('--hover-button-y',`${(y*2).toFixed(2)}px`);}
      if (!settled) moving=true;
    });
    if(moving) frame=requestAnimationFrame(tick);else previous=0;
  }
  root.addEventListener('pointermove',pointer,{passive:true});
  root.addEventListener('pointerleave',exitAll,{passive:true});
  root.addEventListener('pointercancel',clearNow,{passive:true});
  // Clear cached geometry when scrolling / resizing, avoiding any sticky or drifting tilt.
  window.addEventListener('scroll',exitAll,{passive:true});
  window.addEventListener('resize',clearNow,{passive:true});
  window.addEventListener('blur',clearNow);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearNow();});
  root.addEventListener('uf-motion-change',()=>{if(!allowed())clearNow();});
  fine.addEventListener?.('change',clearNow);
  reduced.addEventListener?.('change',clearNow);
})();
