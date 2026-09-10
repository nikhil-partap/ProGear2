/* ============================================================
   PROGEAR MATS — site script
   Interaction engine carried over from progear-mats.html
   (loader, reveals, custom cursor, hero lattice, peek previews,
   count-ups, craft stepper) + business logic:
   WhatsApp enquiry forms, product configurator, gallery lightbox.
   ============================================================ */
(function(){
'use strict';
const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(pointer: fine)').matches;
let vh=innerHeight;

/* ---------- BUSINESS CONSTANTS ---------- */
const WA_NUM='917530819890';
const waUrl=msg=>'https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg);
const money=v=>'₹'+v.toLocaleString('en-IN');

/* ---------- TOAST ---------- */
let toastT;
function toast(label,msg){
  const l=$('#toastLabel'),m=$('#toastMsg'),t=$('#toast');
  if(!l||!m||!t)return;
  l.textContent=label;m.textContent=msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('show'),3600);
}

/* ---------- REVEALS ---------- */
function initReveals(){
  if(!$('[data-reveal]'))return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
  }),{threshold:.12});
  $$('[data-reveal]').forEach(el=>io.observe(el));
}

/* ---------- LOADER (home only) ---------- */
const loader=$('#loader');
if(loader){
  function doneLoading(){
    if(loader.classList.contains('done'))return;
    loader.classList.add('done');
    document.body.classList.remove('lock');
    setTimeout(()=>loader.remove(),1000);
    $$('#hero [data-reveal]').forEach(el=>el.classList.add('in'));
    initReveals();
  }
  setTimeout(doneLoading,RM?200:1900);
}else{
  initReveals();
}

/* ---------- NAV / MENU ---------- */
const nav=$('#nav'),burger=$('#burger'),menu=$('#menu');
function updateNav(){
  if(nav)nav.classList.toggle('scrolled',scrollY>30);
}
updateNav();
addEventListener('scroll',updateNav,{passive:true});
function closeMenu(){
  if(!menu||!burger)return;
  menu.classList.remove('open');burger.classList.remove('x');
  burger.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-open','lock');
}
if(burger&&menu){
  burger.addEventListener('click',()=>{
    const o=!menu.classList.contains('open');
    menu.classList.toggle('open',o);burger.classList.toggle('x',o);
    burger.setAttribute('aria-expanded',o);
    document.body.classList.toggle('menu-open',o);
    document.body.classList.toggle('lock',o);
  });
  $$('.m-link').forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
}

/* ---------- CURSOR ---------- */
const dot=$('#cDot'),ring=$('#cRing');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
if(FINE&&dot&&ring){
  addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.transform='translate('+mx+'px,'+my+'px)';
    dot.classList.add('live');ring.classList.add('live');
  },{passive:true});
  document.addEventListener('mouseover',e=>{
    ring.classList.toggle('grow',!!e.target.closest('a,button,input,select,textarea,.gcard'));
  });
}

/* ---------- COUNT-UP ---------- */
function countUp(el){
  const to=+el.dataset.to,start=performance.now(),dur=1600;
  (function step(t){
    const p=Math.min(1,(t-start)/dur),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e).toLocaleString('en-IN');
    if(p<1)requestAnimationFrame(step);
  })(start);
}
const numbers=$('#numbers');
if(numbers){
  const nio=new IntersectionObserver(es=>{
    if(es[0].isIntersecting){
      $$('.count',numbers).forEach(c=>RM?c.textContent=(+c.dataset.to).toLocaleString('en-IN'):countUp(c));
      nio.disconnect();
    }
  },{threshold:.3});
  nio.observe(numbers);
}

/* ---------- CRAFT / PROCESS STEPS ---------- */
const steps=$$('.cstep');
if(steps.length){
  const cImgs=$$('#craftMedia img'),cNum=$('#craftNum');
  function setCraft(i){
    steps.forEach((s,k)=>s.classList.toggle('on',k===i));
    cImgs.forEach((m,k)=>m.classList.toggle('on',k===i));
    if(!cNum)return;
    const t=String(i+1).padStart(2,'0');
    if(cNum.textContent!==t){
      cNum.textContent=t;
      cNum.classList.remove('tick');void cNum.offsetWidth;cNum.classList.add('tick');
    }
  }
  const sio=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)setCraft(+e.target.dataset.step);
  }),{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(s=>sio.observe(s));
}

/* ---------- REVIEW ROTATOR (home quote) ---------- */
const REVIEWS=[
  {q:'They are just best in the business. Try once & thank me later.',n:'Ghoshit B.'},
  {q:'Good quality mat available across all variety. Good feel and soft texture mat at affordable price.',n:'Sachin K.'},
  {q:'Superb quality and lots of variety, highly recommended.',n:'Poonam G.'},
  {q:'Good material and fitting.',n:'Rohit A.'},
  {q:'Quality products with reasonable price.',n:'Praveen P.'},
  {q:'Good quality super.',n:'Mahesh J.'}
];
const rvQ=$('#rvQuote'),rvC=$('#rvCite');
if(rvQ&&rvC){
  let rvi=0,rvPaused=false,rvTimer=null;
  function showReview(i){
    rvi=i%REVIEWS.length;
    rvQ.classList.add('fade');rvC.classList.add('fade');
    setTimeout(()=>{
      rvQ.textContent='\u201C'+REVIEWS[rvi].q+'\u201D';
      rvC.firstChild.textContent=REVIEWS[rvi].n+' \u2014 Google review';
      rvQ.classList.remove('fade');rvC.classList.remove('fade');
    },RM?0:500);
  }
  function rvPlay(){
    if(RM||REVIEWS.length<2)return;
    clearInterval(rvTimer);
    rvTimer=setInterval(()=>{if(!rvPaused)showReview(rvi+1);},5200);
  }
  const qsec=rvQ.closest('.quote');
  if(qsec){
    qsec.addEventListener('mouseenter',()=>rvPaused=true);
    qsec.addEventListener('mouseleave',()=>rvPaused=false);
    qsec.addEventListener('focusin',()=>rvPaused=true);
    qsec.addEventListener('focusout',()=>rvPaused=false);
  }
  rvPlay();
}

/* ---------- PEEK PREVIEW (home collection rows) ---------- */
const peek=$('#peek'),peekEls=$$('#peek img, #peek .ptile');
let pkx=0,pky=0,ptx=0,pty=0,pkOn=false;
if(FINE&&peek&&peekEls.length){
  $$('.prow').forEach(row=>{
    row.addEventListener('mouseenter',e=>{
      ptx=e.clientX;pty=e.clientY;
      if(!pkOn){pkx=ptx;pky=pty;}
      const i=+row.dataset.i;
      peekEls.forEach((el,k)=>el.classList.toggle('on',k===i));
      pkOn=true;peek.classList.add('on');
    });
    row.addEventListener('mousemove',e=>{ptx=e.clientX;pty=e.clientY;});
    row.addEventListener('mouseleave',()=>{pkOn=false;peek.classList.remove('on');});
  });
}

/* ---------- HERO FIELD (interactive lattice) ---------- */
const hero=$('#hero'),canvas=$('#field'),heroInner=$('#heroInner');
let pts=[],W,H,waves=[],ctx=null,heroVis=true;
let fieldStep=()=>{},fieldDraw=()=>{};
const ptr={x:-9999,y:-9999,tx:-9999,ty:-9999,on:false,m:0};
const COL=['rgba(240,236,229,0.18)','rgba(240,236,229,0.34)','rgba(214,196,164,0.62)','rgba(178,143,95,0.95)'];
if(hero&&canvas){
  ctx=canvas.getContext('2d');
  function buildField(){
    W=hero.clientWidth;H=hero.clientHeight;
    const DPR=Math.min(devicePixelRatio||1,2);
    canvas.width=W*DPR;canvas.height=H*DPR;
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    pts=[];
    const gap=W<720?22:26;
    for(let y=gap;y<H-6;y+=gap)
      for(let x=gap;x<W-6;x+=gap)
        pts.push({ox:x,oy:y,dx:0,dy:0,vx:0,vy:0,ph:Math.random()*6.283});
  }
  function drawStatic(){
    ctx.clearRect(0,0,W,H);
    const p0=new Path2D();
    for(const p of pts){p0.moveTo(p.ox+1.05,p.oy);p0.arc(p.ox,p.oy,1.05,0,6.283);}
    ctx.fillStyle=COL[0];ctx.fill(p0);
  }
  function fieldStepImpl(now){
    ptr.m+=((ptr.on?1:0)-ptr.m)*0.08;
    if(ptr.x<-999){ptr.x=ptr.tx;ptr.y=ptr.ty;}
    ptr.x+=(ptr.tx-ptr.x)*0.16;ptr.y+=(ptr.ty-ptr.y)*0.16;
    const R=150,R2=R*R,K=0.024,DAMP=0.86;
    for(const p of pts){
      let ax=-K*p.dx,ay=-K*p.dy;
      if(ptr.m>0.01){
        const ddx=p.ox-ptr.x,ddy=p.oy-ptr.y,d2=ddx*ddx+ddy*ddy;
        if(d2<R2&&d2>0.01){
          const d=Math.sqrt(d2),f=1-d/R,push=f*f*2.6*ptr.m;
          ax+=ddx/d*push;ay+=ddy/d*push;
        }
      }
      for(let wi=0;wi<waves.length;wi++){
        const w=waves[wi],age=now-w.t,r=age*0.55;
        const ddx=p.ox-w.x,ddy=p.oy-w.y,d=Math.hypot(ddx,ddy)||1;
        const band=d-r,bw=80;
        if(Math.abs(band)<bw*1.8){
          const g=Math.exp(-(band*band)/(bw*bw));
          const imp=g*1.8*Math.exp(-age*0.0012);
          p.vx+=ddx/d*imp;p.vy+=ddy/d*imp;
        }
      }
      p.vx=(p.vx+ax)*DAMP;p.vy=(p.vy+ay)*DAMP;
      p.dx+=p.vx;p.dy+=p.vy;
    }
    waves=waves.filter(w=>now-w.t<2600);
  }
  function fieldDrawImpl(now){
    ctx.clearRect(0,0,W,H);
    const paths=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
    const t=now*0.001;
    for(const p of pts){
      const m=Math.hypot(p.dx,p.dy),n=Math.min(m/26,1);
      const b=n<0.1?0:n<0.28?1:n<0.58?2:3;
      const x=p.ox+p.dx+(RM?0:Math.sin(t*0.7+p.ph)*1.4);
      const y=p.oy+p.dy+(RM?0:Math.cos(t*0.55+p.ph*1.37)*1.4);
      if(x<-4||x>W+4||y<-4||y>H+4)continue;
      const r=1.05+n*1.5;
      paths[b].moveTo(x+r,y);
      paths[b].arc(x,y,r,0,6.283);
    }
    for(let i=0;i<4;i++){ctx.fillStyle=COL[i];ctx.fill(paths[i]);}
    if(ptr.m>0.02&&ptr.x>-500){
      ctx.beginPath();ctx.arc(ptr.x,ptr.y,12,0,6.283);
      ctx.strokeStyle='rgba(178,143,95,'+(0.5*ptr.m)+')';ctx.lineWidth=1;ctx.stroke();
    }
  }
  hero.addEventListener('pointermove',e=>{
    const r=hero.getBoundingClientRect();
    ptr.tx=e.clientX-r.left;ptr.ty=e.clientY-r.top;ptr.on=true;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>ptr.on=false);
  hero.addEventListener('pointerdown',e=>{
    if(e.target.closest('a,button'))return;
    const r=hero.getBoundingClientRect();
    waves.push({x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()});
  });
  buildField();
  if(RM)drawStatic();
  fieldStep=fieldStepImpl;fieldDraw=fieldDrawImpl;
  new IntersectionObserver(en=>heroVis=en[0].isIntersecting).observe(hero);
  window.__buildField=()=>{buildField();if(RM)drawStatic();};
}

/* ---------- WHATSAPP ENQUIRY FORM (home + contact) ---------- */
$$('form.wa-form').forEach(form=>{
  form.addEventListener('input',e=>{
    const f=e.target.closest('.field');
    if(f){const err=f.querySelector('.err');if(err)err.textContent='';e.target.classList.remove('invalid');}
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    let ok=true;
    const setErr=(inp,msg)=>{
      const err=inp.closest('.field').querySelector('.err');
      if(msg){err.textContent=msg;inp.classList.add('invalid');ok=false;}
      else{err.textContent='';inp.classList.remove('invalid');}
    };
    const name=$('#fName'),phone=$('#fPhone'),car=$('#fCar');
    const interest=$('#fInterest'),msg=$('#fMsg');
    setErr(name,name.value.trim().length<2?'Required':'');
    setErr(phone,/[\d]{7,}/.test(phone.value.replace(/[^\d]/g,''))?'':'Invalid phone');
    setErr(car,car.value.trim().length<2?'Required':'');
    if(!ok)return;
    const lines=[
      'Hi ProGear Mats!',
      'Name: '+name.value.trim(),
      'Phone: '+phone.value.trim(),
      'Car: '+car.value.trim(),
      'Interested in: '+(interest?interest.value:'General enquiry'),
      'Message: '+(msg&&msg.value.trim()?msg.value.trim():'\u2014')
    ];
    const btn=form.querySelector('.btn-submit');
    btn.disabled=true;
    btn.dataset.label=btn.textContent;
    btn.textContent='OPENING WHATSAPP\u2026';
    window.open(waUrl(lines.join('\n')),'_blank','noopener,noreferrer');
    toast('ENQUIRY READY','WhatsApp opened with your details pre-filled.');
    const okEl=$('#formOk');
    if(okEl){okEl.classList.add('show');setTimeout(()=>okEl.classList.remove('show'),7000);}
    setTimeout(()=>{
      btn.disabled=false;
      btn.textContent=btn.dataset.label;
      form.reset();
    },1400);
  });
});

/* ---------- GALLERY: FILTERS + LIGHTBOX ---------- */
const ggrid=$('#ggrid');
if(ggrid){
  const cards=$$('.gcard',ggrid);
  /* filters */
  $$('.gfilter').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.gfilter').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      const f=btn.dataset.filter;
      let shown=0;
      cards.forEach(c=>{
        const show=f==='all'||c.dataset.grade===f;
        c.classList.toggle('hide',!show);
        if(show)shown++;
      });
      const count=$('#gcount');
      if(count)count.textContent=shown+' fitment'+(shown===1?'':'s');
    });
  });
  /* lightbox */
  const lb=$('#lightbox');
  if(lb){
    const lbImg=$('#lbImg'),lbIdx=$('#lbIndex'),lbName=$('#lbName'),lbType=$('#lbType'),lbCta=$('#lbCta');
    let cur=-1,imgI=0,curImgs=[];
    function lbRender(){
      const c=cards[cur],model=c.dataset.model,type=c.dataset.type;
      lbImg.src=curImgs[imgI];
      lbImg.alt=model+' '+type+' car mats \u2014 fitment photo '+(imgI+1);
      lbIdx.textContent='0'+(imgI+1)+' / 0'+curImgs.length;
      lbName.textContent=model;
      lbType.textContent=type+' \u00B7 confirmed fitment';
      lbCta.href=waUrl('Hi ProGear Mats! I saw the '+model+' ('+type+') fitment on your website. Please share options for my car.');
    }
    function lbOpen(i){
      cur=i;
      curImgs=JSON.parse(cards[i].dataset.images);
      imgI=0;
      lbRender();
      lb.classList.add('open');
      document.body.classList.add('lock');
      $('#lbClose').focus({preventScroll:true});
    }
    function lbCloseFn(){
      lb.classList.remove('open');
      if(!menu||!menu.classList.contains('open'))document.body.classList.remove('lock');
    }
    function lbMove(d){
      imgI=(imgI+d+curImgs.length)%curImgs.length;
      lbRender();
    }
    cards.forEach((c,i)=>c.addEventListener('click',()=>lbOpen(i)));
    $('#lbClose').addEventListener('click',lbCloseFn);
    $('#lbPrev').addEventListener('click',()=>lbMove(-1));
    $('#lbNext').addEventListener('click',()=>lbMove(1));
    addEventListener('keydown',e=>{
      if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')lbCloseFn();
      if(e.key==='ArrowLeft')lbMove(-1);
      if(e.key==='ArrowRight')lbMove(1);
    });
  }
}

/* ---------- PRODUCT CONFIGURATOR ---------- */
  const pdData=document.getElementById('productData');
if(pdData){
  const p=JSON.parse(pdData.textContent);
  const initIdx=p.colours.length?Math.max(0,p.images.indexOf(p.colours[0].img)):0;
  const state={category:'Normal',seats:'5',colour:p.colours.length?p.colours[0].name:'Standard',image:initIdx};
  const mediaImgs=$$('#pdMedia img'),thumbs=$$('#pdThumbs button');
  const priceEl=$('#pdPrice'),mrpEl=$('#pdMrp'),bestEl=$('#tagBest');
  const swWrap=$('#pdSwatches'),swName=$('#pdSwName');
  const brandSel=$('#pdBrand'),modelInp=$('#pdModel');
  const waBtn=$('#waEnquire');

  function setImage(i){
    state.image=i;
    mediaImgs.forEach((im,k)=>im.classList.toggle('on',k===i));
    thumbs.forEach((t,k)=>t.classList.toggle('on',k===i));
  }
  function renderPrice(){
    const pr=(p.prices[state.category]||{})[state.seats];
    if(!pr)return;
    priceEl.textContent=money(pr[0]);
    if(pr[1]>pr[0]&&mrpEl){mrpEl.textContent=money(pr[1]);mrpEl.style.display='';if(bestEl)bestEl.style.display='';}
    else if(mrpEl){mrpEl.style.display='none';if(bestEl)bestEl.style.display='none';}
    renderWa();
  }
  function renderWa(){
    const car=[brandSel&&brandSel.value?brandSel.value:'',modelInp&&modelInp.value.trim()].filter(Boolean).join(' ');
    const pr=(p.prices[state.category]||{})[state.seats];
    const lines=[
      'Hi ProGear Mats!',
      'I\u2019m interested in: '+p.name+' ('+p.type+')',
      'Finish: '+state.colour,
      'Category: '+state.category+' \u00B7 '+state.seats+' seater',
      'Listed price: '+(pr?money(pr[0]):'\u2014'),
      'Car: '+(car||'to be confirmed'),
      'Please confirm the fit for my exact year and variant.'
    ];
    if(waBtn)waBtn.href=waUrl(lines.join('\n'));
  }
  /* swatches */
  if(swWrap){
    swWrap.innerHTML=p.colours.map(c=>
      '<button type="button" class="swatch'+(c.name===state.colour?' sel':'')+'" data-c="'+c.name+'" style="background:'+c.hex+'" aria-label="Finish: '+c.name+'" aria-pressed="'+(c.name===state.colour)+'"></button>'
    ).join('');
    swWrap.addEventListener('click',e=>{
      const b=e.target.closest('.swatch');if(!b)return;
      $$('.swatch',swWrap).forEach(s=>{s.classList.remove('sel');s.setAttribute('aria-pressed','false');});
      b.classList.add('sel');b.setAttribute('aria-pressed','true');
      state.colour=b.dataset.c;
      if(swName)swName.textContent=state.colour;
      const cObj=p.colours.find(c=>c.name===state.colour);
      if(cObj){
        const idx=p.images.indexOf(cObj.img);
        if(idx>=0)setImage(idx);
      }
      renderWa();
    });
  }
  /* thumbs */
  thumbs.forEach((t,k)=>t.addEventListener('click',()=>setImage(k)));
  /* segmented controls */
  $$('[data-seg]').forEach(seg=>{
    seg.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      $$('button',seg).forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      state[seg.dataset.seg]=b.dataset.v;
      if(seg.dataset.seg==='category'&&brandSel){
        const list=p.brands[state.category]||[];
        brandSel.innerHTML='<option value="">Select brand</option>'+list.map(x=>'<option>'+x+'</option>').join('');
      }
      renderPrice();
    });
  });
  if(brandSel)brandSel.addEventListener('change',renderWa);
  if(modelInp)modelInp.addEventListener('input',renderWa);
  setImage(state.image);
  renderPrice();
  renderWa();
}

/* ---------- WHATSAPP FLOAT ---------- */
const waFloat=$('#waFloat');
if(waFloat){
  const upd=()=>waFloat.classList.toggle('show',scrollY>480&&!document.body.classList.contains('menu-open'));
  addEventListener('scroll',upd,{passive:true});
  upd();
}

/* ---------- MASTER LOOP ---------- */
const plxWraps=$$('.plx');
function loop(now){
  requestAnimationFrame(loop);
  if(FINE&&dot&&ring){
    rx+=(mx-rx)*0.14;ry+=(my-ry)*0.14;
    ring.style.transform='translate('+rx+'px,'+ry+'px)';
  }
  if(pkOn||(peek&&peek.classList.contains('on'))){
    pkx+=(ptx-pkx)*0.12;pky+=(pty-pky)*0.12;
    const x=Math.min(pkx+28,innerWidth-306);
    const y=Math.max(16,Math.min(pky-193,innerHeight-404));
    peek.style.transform='translate('+x+'px,'+y+'px)';
  }
  if(!RM){
    if(heroInner&&scrollY<vh){
      heroInner.style.transform='translateY('+(scrollY*0.3)+'px)';
      heroInner.style.opacity=Math.max(0,1-scrollY/(vh*0.9));
    }
    for(const w of plxWraps){
      const r=w.getBoundingClientRect();
      if(r.bottom<0||r.top>vh)continue;
      const p2=(r.top+r.height/2-vh/2)/vh;
      w.querySelector('img').style.transform='translateY('+(p2*7)+'%) scale(1.12)';
    }
    if(hero&&ctx&&heroVis){fieldStep(now);fieldDraw(now);}
  }
}
requestAnimationFrame(loop);
addEventListener('resize',()=>{
  vh=innerHeight;
  if(window.__buildField)window.__buildField();
},{passive:true});
})();
