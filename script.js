/** UPFOREX homepage concept - dependency-free progressive enhancement.
 * Page remains readable when JavaScript is unavailable.
 * Market charts and ticker prices are illustrative. Reviews are reproduced from the provided source snapshot.
 */
(() => {
  'use strict';
  const root = document.getElementById('uf-home');
  if (!root) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = reduceMotion.matches;
  const motion = () => !motionPaused && !reduceMotion.matches && !document.hidden;
  const $ = (s, base = root) => base.querySelector(s);
  const $$ = (s, base = root) => Array.from(base.querySelectorAll(s));

  $('#currentYear').textContent = String(new Date().getFullYear());
  root.classList.add('js-enabled');

  // Scroll-reveal: animated only when a section enters view. Reduced motion shows instantly.
  const revealNodes = $$('.animate-in');
  if (!motion() || !('IntersectionObserver' in window)) {
    revealNodes.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { target.classList.add('in-view'); observer.unobserve(target); }
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -12px 0px' });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  // Accessible responsive navigation.
  const menuButton = $('.mobile-menu-button');
  const menu = $('#mobile-navigation');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); };
  const toggleMenu = () => {
    const nextState = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !nextState;
    menuButton.setAttribute('aria-expanded', String(nextState));
    menuButton.setAttribute('aria-label', nextState ? 'Close menu' : 'Open menu');
  };
  menuButton.addEventListener('click', toggleMenu);
  $$('#mobile-navigation a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 850 && !menu.hidden) closeMenu(); }, { passive: true });

  // Pointer hover interactions are handled in hover.js.

  // Exact feedback from src/app/layouts/social-menu/social-menu.component.html in supplied ZIP.
  // No claim that the snapshot reflects current aggregate ratings.
  const reviews = [
  {
    "title": "Very fantastic services even customer…",
    "text": "Very fantastic services even customer help get on Sunday.",
    "name": "Yuvraj singh Kachhawa",
    "region": "Aug 10, 2026"
  },
  {
    "title": "Best Broker used till Date",
    "text": "This is by far the best broker that I have used for trading… 3 cheers to the Support team.",
    "name": "Raviraj Singh Tomar",
    "region": "Aug 10, 2026"
  },
  {
    "title": "Very Good and reliable service",
    "text": "Very Good and reliable service. I get support for my query on Sunday also. Very Fast.",
    "name": "Umang Suthar",
    "region": "Jun 22, 2026"
  }
];
  const reviewContainer = $('#reviewCards');
  const dotContainer = $('#reviewDots');
  const carouselRegion = $('.review-carousel');
  let reviewIndex = 0;
  let autoTimer = null;
  let paused = false;
  let reviewsVisible = false;
  const visibleCount = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
  const reviewCard = (item, i) => {
    const article = document.createElement('article'); article.className = 'review-card';
    article.style.animationDelay = `${i * 75}ms`;
    const node = (tag, cls, text) => { const el=document.createElement(tag);el.className=cls;el.textContent=text;return el; };
    const meta=node('div','footer-review-meta','');
    const rating=node('div','rating','★★★★★');rating.setAttribute('aria-label','5 stars in source review');
    meta.append(rating,node('span','footer-review-date',item.region));
    const glyph=node('span','quote-glyph','”');glyph.setAttribute('aria-hidden','true');
    const author=node('div','footer-review-author',''); const initial=node('span','review-initial',item.name.charAt(0).toUpperCase()); initial.setAttribute('aria-hidden','true'); author.append(initial,node('span','review-name',item.name));
    article.append(meta,node('h3','footer-review-title',item.title),node('blockquote','footer-review-quote',item.text),author,glyph);
    return article;
  };
  function renderReviews() {
    const count = visibleCount();
    const nextItems = Array.from({ length: count }, (_, index) => reviews[(reviewIndex + index) % reviews.length]);
    const focusedDot = dotContainer.contains(document.activeElement) ? Array.from(dotContainer.children).indexOf(document.activeElement) : -1;
    reviewContainer.replaceChildren(...nextItems.map(reviewCard));
    dotContainer.replaceChildren(...reviews.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.setAttribute('aria-label', `Show testimonial group ${i + 1}`);
      dot.setAttribute('aria-current', i === reviewIndex ? 'true' : 'false');
      dot.addEventListener('click', () => { reviewIndex = i; renderReviews(); restartCarousel(); });
      return dot;
    }));
    if (focusedDot >= 0) dotContainer.children[focusedDot]?.focus({preventScroll:true});
  }
  function moveReview(shift) { reviewIndex = (reviewIndex + shift + reviews.length) % reviews.length; renderReviews(); }
  $('.arrow-left').addEventListener('click', () => { moveReview(-1); restartCarousel(); });
  $('.arrow-right').addEventListener('click', () => { moveReview(1); restartCarousel(); });
  function stopCarousel() { if (autoTimer !== null) { clearInterval(autoTimer); autoTimer = null; } }
  function restartCarousel() {
    stopCarousel();
    if (motion() && !paused && reviewsVisible && visibleCount() < reviews.length) autoTimer = setInterval(() => moveReview(1), 6800);
  }
  carouselRegion.addEventListener('mouseenter', () => { paused = true; stopCarousel(); });
  carouselRegion.addEventListener('mouseleave', () => { paused = false; restartCarousel(); });
  carouselRegion.addEventListener('focusin', () => { paused = true; stopCarousel(); });
  carouselRegion.addEventListener('focusout', (event) => {
    if (!carouselRegion.contains(event.relatedTarget)) { paused = false; restartCarousel(); }
  });
  carouselRegion.addEventListener('touchstart', () => { paused = true; stopCarousel(); }, { passive: true });
  carouselRegion.addEventListener('touchend', () => { paused = false; restartCarousel(); }, { passive: true });
  let prevVisibleCount = visibleCount();
  window.addEventListener('resize', () => { const next = visibleCount(); if (next !== prevVisibleCount) { prevVisibleCount = next; renderReviews(); restartCarousel(); } }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopCarousel(); else restartCarousel(); });
  renderReviews();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { reviewsVisible=entry.isIntersecting; restartCarousel(); }, {threshold:.08}).observe(carouselRegion);
  } else { reviewsVisible=true; restartCarousel(); }
  let touchStart = 0;
  carouselRegion.addEventListener('touchstart',e => { touchStart=e.changedTouches[0].clientX; },{passive:true});
  carouselRegion.addEventListener('touchend',e => { const dx=e.changedTouches[0].clientX-touchStart; if(Math.abs(dx)>55) moveReview(dx<0?1:-1); },{passive:true});


  // Deterministic, illustrative OHLC data. Not a price feed or investment signal.
  const marketData = {
    forex:{name:'Forex',text:'Explore major currency pairs and the movements that connect global currency markets.',icon:'FX',pair:'EUR / USD',route:'forex-cfds',seed:17,price:1.0942,decimals:4,volatility:.014},
    metals:{name:'Metals',text:'Discover precious metal CFDs, including gold, and their role in global markets.',icon:'Au',pair:'XAU / USD',route:'precious-metal',seed:32,price:2048.36,decimals:2,volatility:.035},
    indices:{name:'Indices',text:'Explore index CFDs and major international benchmarks.',icon:'IX',pair:'US 100',route:'index-cfds',seed:56,price:18563.2,decimals:1,volatility:.025},
    stocks:{name:'Stocks',text:'Explore stock CFDs and the factors that influence equity markets.',icon:'EQ',pair:'STOCK CFD',route:'stock-cfds',seed:87,price:180.5,decimals:2,volatility:.06},
    crypto:{name:'Crypto',text:'Explore cryptocurrency CFDs and the volatility of digital-asset markets.',icon:'₿',pair:'BTC / USD',route:'cryptocurrencies-cfd',seed:103,price:67842.1,decimals:1,volatility:.09},
    energy:{name:'Energy',text:'Explore energy CFDs and the forces affecting oil and other energy markets.',icon:'EN',pair:'OIL CFD',route:'energy-cfds',seed:129,price:78.5,decimals:2,volatility:.065}
  };
  const chart=$('#marketChart'), grid=$('#candleGrid'), volumes=$('#candleVolumes'), bodies=$('#candleBodies'), axes=$('#candleAxes'), marker=$('#priceMarker'), cross=$('#chartCrosshair'), tooltip=$('#chartTooltip');
  const marketTabs=$$('.market-tab'), periods=$$('.time-pill');
  const N=44, NS='http://www.w3.org/2000/svg';
  let selectedMarket='forex',selectedPeriod='1D',chartVisible=false,chartRaf=0,current=null,cursor=-1,layout=null,targetData=null,chartMode='desktop';
  function node(tag,attrs={},text=''){const el=document.createElementNS(NS,tag); for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text)el.textContent=text;return el;}
  function setAttrs(el,attrs){for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));}
  const candleNodes=Array.from({length:N},()=>{const wick=node('line',{class:'candle-wick'}),body=node('rect',{rx:1,class:'candle-body'}),vol=node('rect',{rx:1});bodies.append(wick,body);volumes.append(vol);return {wick,body,vol};});
  function generate(name,period){
    const d=marketData[name],p=['1D','1W','1M','3M'].indexOf(period), f=[1,1.6,2.25,3][p];
    let seed=(d.seed*92821+p*937+11)>>>0;
    const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let prev=.34+rand()*.15;
    return Array.from({length:N},(_,i)=>{
      const t=i/(N-1),o=prev+(rand()-.5)*.035;
      // Local pullbacks, alternating candle colors, and non-monotonic market swings.
      const drift=(name==='crypto'?-.002:.008)+Math.sin(t*16+p+d.seed)*.022;
      const c=Math.max(.13,Math.min(.87,o+drift+(rand()-.46)*.14));
      const h=Math.max(o,c)+.012+rand()*.047,l=Math.min(o,c)-.012-rand()*.045;
      prev=c;return {o,c,h,l,v:.18+rand()*.67+Math.abs(c-o)*1.5,base:d.price,spread:d.price*d.volatility*f};
    });
  }
  function price(v,item){return item.base+(v-.5)*item.spread;}
  const fmt=(n)=>n.toLocaleString('en-US',{minimumFractionDigits:marketData[selectedMarket].decimals,maximumFractionDigits:marketData[selectedMarket].decimals});
  function chartLayout(){
    const small=chart.clientWidth<510,W=small?Math.max(230,chart.clientWidth):840,H=small?240:345;
    chartMode=small?'mobile':'desktop';chart.setAttribute('viewBox',`0 0 ${W} ${H}`);
    const left=small?4:12,right=W-(small?60:78),top=14,priceBottom=H-(small?68:77),volTop=priceBottom+10,volBottom=H-24;
    return {W,H,left,right,top,priceBottom,volTop,volBottom,step:(right-left)/N};
  }
  function draw(data){
    if(!data)return;current=data;layout=chartLayout();const {W,H,left,right,top,priceBottom,volTop,volBottom,step}=layout;
    const low=Math.min(...data.map(c=>c.l)),high=Math.max(...data.map(c=>c.h)),padding=Math.max(.04,(high-low)*.13);
    layout.min=low-padding;layout.max=high+padding;
    const y=v=>priceBottom-(v-layout.min)/(layout.max-layout.min)*(priceBottom-top);
    const base=data[0],lastY=y(data[N-1].c); grid.replaceChildren();axes.replaceChildren();marker.replaceChildren();
    for(let j=0;j<=5;j++){const v=layout.min+(layout.max-layout.min)*j/5,Y=y(v);grid.append(node('line',{x1:left,y1:Y,x2:right,y2:Y}));if(Math.abs(Y-lastY)>16)axes.append(node('text',{x:right+8,y:Y+4,class:'axis-price'},fmt(price(v,base))));}
    for(let j=0;j<=5;j++){const x=left+(right-left)*j/5;grid.append(node('line',{x1:x,y1:top,x2:x,y2:volBottom}));}
    const times={'1D':['00:00','04:00','08:00','12:00','16:00','20:00'],'1W':['Mon','Tue','Wed','Thu','Fri','End'],'1M':['W1','W2','W3','W4','W5','End'],'3M':['Start','W2','W5','W7','W10','End']}[selectedPeriod];
    times.forEach((s,i)=>{if(chartMode==='mobile'&&![0,2,4,5].includes(i))return;axes.append(node('text',{x:left+(right-left)*i/5,y:H-9,'text-anchor':i===0?'start':i===5?'end':'middle',class:'axis-time'},s));});
    data.forEach((c,i)=>{const x=left+step*(i+.5),up=c.c>=c.o,color=up?'#3cff19':'#ff5d67',bw=step*.62;const n=candleNodes[i];setAttrs(n.wick,{x1:x,x2:x,y1:y(c.h),y2:y(c.l),stroke:color});setAttrs(n.body,{x:x-bw/2,y:Math.min(y(c.o),y(c.c)),width:bw,height:Math.max(1.6,Math.abs(y(c.o)-y(c.c))),fill:color});const vh=Math.min(1,c.v)*(volBottom-volTop);setAttrs(n.vol,{x:x-bw/2,y:volBottom-vh,width:bw,height:vh,fill:color,opacity:.34});});
    const last=data[N-1],Y=y(last.c),color=last.c>=last.o?'#3cff19':'#ff5d67';
    marker.append(node('line',{x1:left,x2:right,y1:Y,y2:Y,stroke:color,'stroke-opacity':.65,'stroke-dasharray':'4 5'}),node('rect',{x:right+3,y:Y-11,width:W-right-5,height:22,rx:3,fill:color}),node('text',{x:right+3+(W-right-5)/2,y:Y+4,'text-anchor':'middle',fill:'#0d0d0d',class:'price-label'},fmt(price(last.c,last))));
    $('#chartLast').textContent=fmt(price(last.c,last));const change=(price(last.c,last)/price(data[0].o,data[0])-1)*100;$('#chartChange').textContent=`${change>=0?'+':''}${change.toFixed(2)}%`;$('#chartChange').classList.toggle('negative',change<0);
    if(cursor>=0)showCursor(cursor);
  }
  function clearCursor(){cursor=-1;cross.setAttribute('visibility','hidden');tooltip.hidden=true;}
  function showCursor(i){if(!current||!layout)return;cursor=Math.max(0,Math.min(N-1,i));const c=current[cursor],{W,H,left,right,top,priceBottom,volBottom,step}=layout,x=left+step*(cursor+.5),y=priceBottom-(c.c-layout.min)/(layout.max-layout.min)*(priceBottom-top);setAttrs($('#crossV'),{x1:x,x2:x,y1:top,y2:volBottom});setAttrs($('#crossH'),{x1:left,x2:right,y1:y,y2:y});cross.setAttribute('visibility','visible');tooltip.textContent=`O ${fmt(price(c.o,c))}   H ${fmt(price(c.h,c))}   L ${fmt(price(c.l,c))}   C ${fmt(price(c.c,c))}`;tooltip.hidden=false;}
  chart.addEventListener('pointermove',e=>{const r=chart.getBoundingClientRect();if(!layout||!r.width)return;showCursor(Math.floor(((e.clientX-r.left)/r.width*layout.W-layout.left)/layout.step));});
  chart.addEventListener('pointerleave',clearCursor);chart.addEventListener('blur',clearCursor);
  chart.tabIndex=0;chart.addEventListener('keydown',e=>{if(e.key==='Escape'){clearCursor();return;}if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();showCursor(cursor<0?N-1:cursor+(e.key==='ArrowLeft'?-1:1));});
  function renderMarket(animate=true){
    const d=marketData[selectedMarket],title=$('#selectedMarketName');title.replaceChildren(document.createTextNode(d.name+' '));const em=document.createElement('span');em.textContent='markets';title.append(em);
    $('#selectedMarketDesc').textContent=d.text;$('#marketDisplayIcon').textContent=d.icon;$('#marketPair').textContent=d.pair;$('#marketPairCaption').textContent=`Illustrative ${selectedPeriod} candles`;$('#marketProductLink').href='https://www.upforex.com/products/'+d.route;$('#marketProductLink').textContent=`Explore ${d.name} CFDs ↗`;
    chart.setAttribute('aria-label',`${d.name} ${selectedPeriod} illustrative OHLC candles. Use left or right arrow to inspect candles. Not live prices.`);
    clearCursor();cancelAnimationFrame(chartRaf);targetData=generate(selectedMarket,selectedPeriod);
    const info=$('.market-display-top');info.classList.remove('market-changing');void info.offsetWidth;info.classList.add('market-changing');
    if(!current||!animate||!motion()||!chartVisible){draw(targetData);return;}
    const from=current.map((c,i)=>({...c,base:targetData[i].base,spread:targetData[i].spread}));const start=performance.now();
    function step(now){if(!motion()||!chartVisible){draw(targetData);return;}const t=Math.min(1,(now-start)/620),e=1-(1-t)**3;draw(targetData.map((c,i)=>({...c,...Object.fromEntries(['o','h','l','c','v'].map(k=>[k,from[i][k]+(c[k]-from[i][k])*e]))})));if(t<1)chartRaf=requestAnimationFrame(step);}
    chartRaf=requestAnimationFrame(step);
  }
  function setMarket(name,focus=false){if(!marketData[name])return;selectedMarket=name;marketTabs.forEach(tab=>{const on=tab.dataset.market===name;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(on){$('#marketPanel').setAttribute('aria-labelledby',tab.id);if(focus){tab.focus({preventScroll:true});if(innerWidth<=850)tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}}});renderMarket();}
  marketTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>setMarket(tab.dataset.market));tab.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?marketTabs.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+marketTabs.length)%marketTabs.length;setMarket(marketTabs[j].dataset.market,true);});});
  periods.forEach(btn=>btn.addEventListener('click',()=>{selectedPeriod=btn.dataset.period;periods.forEach(x=>{const on=x===btn;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});renderMarket();}));
  renderMarket(false);
  if('IntersectionObserver' in window){let entered=false;new IntersectionObserver(([entry])=>{chartVisible=entry.isIntersecting;if(chartVisible&&!entered){entered=true;if(motion()){bodies.classList.add('candles-enter');volumes.classList.add('candles-enter');}}},{threshold:.12}).observe(chart);}else chartVisible=true;
  if('ResizeObserver' in window){new ResizeObserver(()=>draw(current)).observe(chart);}else window.addEventListener('resize',()=>draw(current),{passive:true});
  // Pause decorative CSS animations when sections leave the viewport.
  if('IntersectionObserver' in window){const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('offscreen-motion',!entry.isIntersecting)),{rootMargin:'100px 0px'});$$('main section, .premium-footer').forEach(el=>sectionObserver.observe(el));}
  const languageMenu=$('.language-menu');
  document.addEventListener('click',e=>{if(languageMenu?.open&&!languageMenu.contains(e.target))languageMenu.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&languageMenu?.open){languageMenu.open=false;languageMenu.querySelector('summary').focus();}});

  // Glowing rotating dot globe. Uses only a 2D canvas: no heavy 3D model, no network, no WebGL.
  const canvas = $('#globeCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Simplified land outlines are only used to decide where the glow dots appear.
  // They are stylized to achieve the reference-image aesthetic, not geospatial data.
  const polygons = [
    // Europe + Asia
    [[-11,36],[-10,44],[-8,54],[-1,58],[6,62],[10,70],[20,71],[30,69],[39,68],[49,72],[58,74],[78,73],[93,77],[116,72],[140,66],[157,60],[164,51],[151,45],[142,36],[130,32],[122,22],[111,14],[103,2],[94,7],[85,18],[77,9],[71,16],[59,26],[51,29],[46,41],[39,42],[33,35],[26,41],[21,38],[13,44],[5,43],[-3,36]],
    // Africa
    [[-17,35],[-8,38],[1,36],[10,37],[20,33],[30,32],[34,29],[43,12],[51,8],[42,-3],[40,-13],[35,-20],[32,-29],[23,-35],[17,-34],[12,-24],[7,-7],[-2,4],[-13,6],[-17,19]],
    // Arabia
    [[34,30],[42,30],[50,24],[56,19],[52,12],[45,12],[40,17],[35,23]],
    // North America
    [[-168,64],[-160,71],[-143,69],[-131,57],[-124,49],[-125,40],[-117,33],[-110,28],[-104,29],[-96,25],[-91,19],[-86,15],[-80,18],[-82,28],[-73,36],[-65,44],[-55,50],[-60,57],[-78,59],[-91,66],[-110,70],[-126,72]],
    // South America
    [[-80,10],[-73,13],[-65,10],[-57,5],[-50,1],[-47,-10],[-40,-14],[-45,-25],[-54,-35],[-65,-54],[-72,-44],[-75,-30],[-81,-11]],
    // Australia
    [[112,-11],[130,-10],[138,-13],[152,-22],[153,-34],[141,-39],[126,-36],[114,-28]],
    // Greenland
    [[-58,59],[-42,60],[-37,70],[-45,82],[-60,85],[-70,74]],
    // Japan and islands
    [[128,32],[136,34],[144,42],[146,46],[142,41],[135,36]]
  ];
  function isInsidePolygon(lon, lat, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const [xi, yi] = vertices[i]; const [xj, yj] = vertices[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  const RAD = Math.PI / 180;
  const dots = [];
  for (let latitude = -82; latitude <= 82; latitude += 2.5) {
    for (let longitude = -180; longitude < 180; longitude += 2.5) {
      const lat = latitude + Math.sin(longitude * RAD * 4) * 1.1;
      const lon = longitude + Math.sin(latitude * RAD * 6) * 1.0;
      const land = polygons.some((poly) => isInsidePolygon(lon, lat, poly));
      dots.push({ x: Math.cos(lat * RAD) * Math.cos(lon * RAD), y: Math.sin(lat * RAD), z: Math.cos(lat * RAD) * Math.sin(lon * RAD), land, lat, lon });
    }
  }
  let lastTick = 0;
  let phase = 0;
  let cameraYaw=0,cameraPitch=0,targetYaw=0,targetPitch=0;
  const globeStage=canvas.closest('.hero-visual');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  globeStage.addEventListener('pointermove',event=>{
    if(!motion()||!finePointer.matches||event.pointerType!=='mouse')return;
    const rect=globeStage.getBoundingClientRect();
    targetYaw=Math.max(-.6,Math.min(.6,((event.clientX-rect.left)/rect.width-.5)*1.2));
    targetPitch=Math.max(-.24,Math.min(.24,((event.clientY-rect.top)/rect.height-.5)*.48));
  },{passive:true});
  const resetCamera=()=>{targetYaw=0;targetPitch=0;};
  globeStage.addEventListener('pointerleave',resetCamera,{passive:true});
  globeStage.addEventListener('pointercancel',resetCamera,{passive:true});
  window.addEventListener('blur',resetCamera);
  // Stylized connection nodes, not a network or geographic service-availability map.
  const hubs=[[0,51],[28,-26],[55,25],[104,1],[-74,40],[139,35]];
  const networkEdges=[[0,1],[0,2],[0,4],[2,3],[3,5],[1,3]];
  const asSphere=([lon,lat])=>{let a=lat*RAD,b=lon*RAD;return [Math.cos(a)*Math.cos(b),Math.sin(a),Math.cos(a)*Math.sin(b)];};
  const hubVectors=hubs.map(asSphere);
  const routes=networkEdges.map(([a,b])=>{
    const v=hubVectors[a],u=hubVectors[b],omega=Math.acos(Math.max(-1,Math.min(1,v.reduce((sum,x,i)=>sum+x*u[i],0))));
    return Array.from({length:45},(_,i)=>{let t=i/44,sa=Math.sin((1-t)*omega)/Math.sin(omega),sb=Math.sin(t*omega)/Math.sin(omega),lift=1+.085*Math.sin(t*Math.PI);return v.map((x,j)=>(x*sa+u[j]*sb)*lift);});
  });
  let globeVisible = true;
  let globeFrame = 0;
  let dimensions = { w: 600, h: 600, dpr: 1 };
  function resizeCanvas() {
    const size = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(size.width)), h = Math.max(1, Math.round(size.height));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dimensions = { w, h, dpr };
    drawGlobe();
  }
  function drawGlobe() {
    const { w, h } = dimensions;
    ctx.clearRect(0, 0, w, h);
    const cx = w * .50, cy = h * .50, r = Math.min(w * .42, h * .40);
    const baseGradient = ctx.createRadialGradient(cx - r * .31, cy - r * .43, 0, cx, cy, r * 1.08);
    baseGradient.addColorStop(0, '#154f69'); baseGradient.addColorStop(.48, '#0b2839'); baseGradient.addColorStop(.84, '#06141e'); baseGradient.addColorStop(1, '#03090e');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = baseGradient; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    // latitude and longitude grid -- perspective projection
    const sin = Math.sin(phase+cameraYaw), cos = Math.cos(phase+cameraYaw),sp=Math.sin(cameraPitch+.12),cp=Math.cos(cameraPitch+.12);
    const project = (x,y,z) => { const xx=x*cos-z*sin,zz=x*sin+z*cos;return {x:cx+r*xx,y:cy-r*(y*cp-zz*sp),depth:y*sp+zz*cp}; };
    ctx.strokeStyle = 'rgba(156,255,150,.105)'; ctx.lineWidth = 0.75;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath(); let start = true;
      for (let lon = -180; lon <= 180; lon += 3) {
        const a = lat * RAD, b = lon * RAD;
        const pos = project(Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b));
        if (pos.depth > 0) { if (start) { ctx.moveTo(pos.x, pos.y); start = false; } else ctx.lineTo(pos.x, pos.y); } else start = true;
      } ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath(); let start = true;
      for (let lat = -90; lat <= 90; lat += 2) {
        const a = lat * RAD, b = lon * RAD;
        const pos = project(Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b));
        if (pos.depth > 0) { if (start) { ctx.moveTo(pos.x, pos.y); start = false; } else ctx.lineTo(pos.x, pos.y); } else start = true;
      } ctx.stroke();
    }
    // Group dots into opacity/color buckets so there are fewer Canvas paint operations.
    const buckets=Array.from({length:16},()=>[]);
    for(const dot of dots){
      const q=project(dot.x,dot.y,dot.z);if(q.depth<.018)continue;
      const level=Math.min(7,Math.floor(q.depth*8));
      buckets[(dot.land?8:0)+level].push(q);
    }
    for(let i=0;i<buckets.length;i++){
      const land=i>=8,level=i%8,opacity=(level+.9)/8;
      ctx.fillStyle=land?`rgba(${Math.round(58+opacity*48)},255,${Math.round(120+opacity*61)},${opacity*.90})`:`rgba(83,182,236,${opacity*.33})`;
      const rad=(land?Math.max(.65,r/210):.42)*(.52+opacity*.73);
      ctx.beginPath();for(const q of buckets[i]){ctx.moveTo(q.x+rad,q.y);ctx.arc(q.x,q.y,rad,0,Math.PI*2);}ctx.fill();
    }
    // Lit coastline segments help the geographic silhouette read at a glance.
    ctx.strokeStyle='rgba(105,245,165,.22)';ctx.lineWidth=.8;
    polygons.forEach(poly=>{ctx.beginPath();let open=false;for(let j=0;j<=poly.length;j++){const [lon,lat]=poly[j%poly.length];const a=lat*RAD,b=lon*RAD;const q=project(Math.cos(a)*Math.cos(b),Math.sin(a),Math.cos(a)*Math.sin(b));if(q.depth>.04){if(open)ctx.lineTo(q.x,q.y);else{ctx.moveTo(q.x,q.y);open=true;}}else open=false;}ctx.stroke();});
    ctx.restore();
    // Project animated connection arcs and moving signal nodes over the globe.
    routes.forEach((route,i)=>{
      const points=route.map(v=>project(...v));
      const stroke=(color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();let open=false;for(const q of points){if(q.depth>.045){if(open)ctx.lineTo(q.x,q.y);else {ctx.moveTo(q.x,q.y);open=true;}}else open=false;}ctx.stroke();};
      stroke('rgba(37,222,255,.13)',5);stroke(i%2?'rgba(114,255,106,.65)':'rgba(81,204,255,.7)',1.05);
      const k=Math.floor(((phase*.85+i*.19)%1+1)%1*(points.length-1));const q=points[k];
      if(q.depth>.08){ctx.beginPath();ctx.arc(q.x,q.y,3.1,0,Math.PI*2);ctx.fillStyle='#c6fff1';ctx.fill();ctx.beginPath();ctx.arc(q.x,q.y,6.4,0,Math.PI*2);ctx.strokeStyle='rgba(111,255,184,.36)';ctx.lineWidth=1;ctx.stroke();}
    });
    hubVectors.forEach((v,i)=>{const q=project(...v);if(q.depth<.07)return;const pulse=5+2*Math.sin(phase*6+i*1.7);ctx.beginPath();ctx.arc(q.x,q.y,pulse,0,Math.PI*2);ctx.strokeStyle='rgba(96,255,193,.45)';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(q.x,q.y,2.2,0,Math.PI*2);ctx.fillStyle='#c0ff94';ctx.fill();});
    const rim = ctx.createRadialGradient(cx, cy, r * .75, cx, cy, r * 1.08);
    rim.addColorStop(0, 'rgba(60,255,25,0)');rim.addColorStop(.8,'rgba(60,255,25,.025)');rim.addColorStop(.93,'rgba(60,255,25,.19)');rim.addColorStop(1,'rgba(60,255,25,0)');
    ctx.fillStyle = rim;ctx.beginPath();ctx.arc(cx,cy,r*1.08,0,Math.PI*2);ctx.fill();
    const edge=ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);edge.addColorStop(0,'#9af8ff');edge.addColorStop(.48,'#337ab2');edge.addColorStop(.8,'#3cff19');edge.addColorStop(1,'#275a49');
    ctx.beginPath();ctx.arc(cx,cy,r+1,0,Math.PI*2);ctx.strokeStyle=edge;ctx.lineWidth=2;ctx.stroke();
  }
  function renderFrame(time) {
    globeFrame = 0;
    if (!motion() || !globeVisible) return;
    if (time - lastTick < 33) { globeFrame = requestAnimationFrame(renderFrame); return; }
    const diff = lastTick ? Math.min(time - lastTick, 100) : 33;
    lastTick = time;
    phase += diff * .00018;
    const cameraEase=1-Math.exp(-diff/180);cameraYaw+=(targetYaw-cameraYaw)*cameraEase;cameraPitch+=(targetPitch-cameraPitch)*cameraEase;
    drawGlobe();
    globeFrame = requestAnimationFrame(renderFrame);
  }
  function refreshGlobe() {
    cancelAnimationFrame(globeFrame);globeFrame = 0;lastTick = 0;
    if (motion() && globeVisible) globeFrame = requestAnimationFrame(renderFrame);
    else drawGlobe();
  }
  if ('IntersectionObserver' in window) {
    const globeObserver = new IntersectionObserver(([entry]) => { globeVisible = entry.isIntersecting; refreshGlobe(); }, { threshold: 0 });
    globeObserver.observe(canvas);
  }
  document.addEventListener('visibilitychange', refreshGlobe);

  window.addEventListener('resize', resizeCanvas, { passive: true });
  phase = Math.PI / 2 - .35;
  resizeCanvas();
  refreshGlobe();
  const motionButton=$('.motion-toggle');
  function applyMotionState(){
    const paused=motionPaused||reduceMotion.matches;
    root.classList.toggle('motion-paused',paused);
    motionButton.setAttribute('aria-pressed',String(paused));
    $('.motion-icon').textContent=paused?'▷':'Ⅱ';$('.motion-text').textContent=reduceMotion.matches?'Reduced motion':paused?'Resume motion':'Pause motion';motionButton.disabled=reduceMotion.matches;
    motionButton.setAttribute('aria-label',paused?'Resume decorative motion':'Pause decorative motion');
    if(paused){ resetCamera();cameraYaw=0;cameraPitch=0; revealNodes.forEach(el=>el.classList.add('in-view'));cancelAnimationFrame(chartRaf);renderMarket(false);$$('.card-tilt').forEach(el=>el.style.transform=''); }
    refreshGlobe();restartCarousel();
    root.dispatchEvent(new Event('uf-motion-change'));
  }
  motionButton.addEventListener('click',()=>{if(reduceMotion.matches)return;motionPaused=!motionPaused;applyMotionState();});
  reduceMotion.addEventListener?.('change',()=>{motionPaused=reduceMotion.matches;applyMotionState();});
  document.addEventListener('visibilitychange',()=>{root.classList.toggle('page-inactive',document.hidden);});
  applyMotionState();
})();
