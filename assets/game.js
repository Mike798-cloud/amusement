(function(){
  const seenKey='chundeng-visited';
  try{const path=location.pathname.split('/').filter(Boolean).slice(-2).join('/');let seen=JSON.parse(localStorage.getItem(seenKey)||'[]');if(path&&!seen.includes(path)){seen.push(path);localStorage.setItem(seenKey,JSON.stringify(seen));}}catch(e){}

  const auth={lab:'chundeng-lab-ok',service:'chundeng-service-ok',archive:'chundeng-archive-ok'};
  document.querySelectorAll('[data-gate]').forEach(el=>{const g=el.dataset.gate;if(auth[g]&&localStorage.getItem(auth[g])!=='1'){location.replace(el.dataset.gateRedirect||'index.html');}});

  document.querySelectorAll('[data-photo]').forEach(btn=>{btn.classList.add('photo-button');btn.addEventListener('click',()=>{const viewer=document.querySelector('.viewer');if(!viewer)return;viewer.querySelector('img').src=btn.querySelector('img').src;viewer.classList.add('open');});});
  document.querySelectorAll('.viewer').forEach(v=>{const close=()=>v.classList.remove('open');v.addEventListener('click',e=>{if(e.target===v)close()});const b=v.querySelector('button');if(b)b.addEventListener('click',close);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.viewer.open').forEach(v=>v.classList.remove('open'));});

  const mapButtons=document.querySelectorAll('[data-map]');
  const mapSeen=new Set();
  let currentMapYear='1999', mapMark=null, compareUsed=false;
  if(mapButtons.length){const target=document.querySelector('#map-image');const marker=document.querySelector('.map-marker');const stage=document.querySelector('[data-map-mark]');const readout=document.querySelector('.mark-readout');const active=[...mapButtons].find(b=>b.classList.contains('active'));if(active?.dataset.year){mapSeen.add(active.dataset.year);currentMapYear=active.dataset.year;}const redraw=()=>{if(!marker)return;if(mapMark&&currentMapYear==='2003'){marker.hidden=false;marker.style.left=mapMark.x+'%';marker.style.top=mapMark.y+'%';}else marker.hidden=true;};mapButtons.forEach(b=>b.addEventListener('click',()=>{mapButtons.forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.year){mapSeen.add(b.dataset.year);currentMapYear=b.dataset.year;}if(target){target.src=b.dataset.map;target.alt=b.textContent+'平面图';}const note=document.querySelector('#map-note');if(note)note.textContent=b.dataset.note||'';redraw();}));if(stage){stage.addEventListener('click',e=>{if(e.target.closest('button'))return;if(currentMapYear!=='2003'){if(readout)readout.textContent='圈选只记录在2003竣工图上；请切到2003图后再点。';return;}const r=stage.getBoundingClientRect();const x=((e.clientX-r.left)/r.width)*100,y=((e.clientY-r.top)/r.height)*100;mapMark={x:+x.toFixed(2),y:+y.toFixed(2)};const form=document.querySelector('form[data-map-check]');if(form){form.elements.markx.value=mapMark.x;form.elements.marky.value=mapMark.y;}if(readout)readout.textContent='已圈选2003竣工图上的一个位置；可再次点击修改。';redraw();});}}
  const cr=document.querySelector('#compare-range'), ct=document.querySelector('#compare-top');if(cr&&ct){const stage=ct.parentElement, img=ct.querySelector('img');const sync=()=>{ct.style.width=cr.value+'%';if(stage&&img)img.style.width=stage.clientWidth+'px';};cr.addEventListener('input',()=>{compareUsed=true;sync();});addEventListener('resize',sync);sync();}

  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;document.querySelectorAll('[data-record]').forEach(r=>{r.style.display=(f==='all'||r.dataset.record===f)?'table-row':'none';});}));

  const mapCheck=document.querySelector('form[data-map-check]');
  if(mapCheck){
    const unlock=document.querySelector('#archive-unlock'), msg=mapCheck.querySelector('.form-msg');
    const show=()=>{if(unlock)unlock.hidden=false;};
    if(localStorage.getItem('chundeng-map-ok')==='1')show();
    mapCheck.addEventListener('submit',e=>{
      e.preventDefault();
      const x=parseFloat(mapCheck.elements.markx?.value||''), y=parseFloat(mapCheck.elements.marky?.value||''), raw=(mapCheck.elements.difference?.value||'').trim();
      const compact=raw.replace(/[，,、。；;\s]/g,'');
      if(msg){msg.className='form-msg';msg.textContent='';}
      if(mapSeen.size<3){if(msg){msg.textContent='三期图还没有看全。请把1999、2003、2006至少各打开一次。';msg.classList.add('error');}return;}
      if(!compareUsed){if(msg){msg.textContent='请先拖动一次叠图，把2003与2006在同一位置对齐比较。';msg.classList.add('error');}return;}
      if(!Number.isFinite(x)||!Number.isFinite(y)||!raw){if(msg){msg.textContent='还缺圈选位置或文字说明。';msg.classList.add('error');}return;}
      const rightSpot=x>=41.5&&x<=55.5&&y>=27.5&&y<=45.5;
      const hasAccess=/(检修口|检修门|检查口|检修洞|检修开口)/.test(compact);
      const hasWall=/(短墙|局部墙|墙体|隔墙|墙线)/.test(compact);
      if(rightSpot&&hasAccess&&hasWall){
        localStorage.setItem('chundeng-map-ok','1');show();
        if(msg){msg.textContent='复核登记完成。项目调阅记录已开放。';msg.classList.add('ok');}
      }else if(msg){msg.textContent='复核没有通过。请回到同一轴网位置，再比较2003与2006的墙线、开口和闭合关系。';msg.classList.add('error');}
    });
  }

  const norm=s=>(s||'').trim().toUpperCase();
  document.querySelectorAll('form[data-puzzle]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const kind=form.dataset.puzzle,msg=form.querySelector('.form-msg');if(msg){msg.className='form-msg';msg.textContent='';}
    const bad=t=>{if(msg){msg.textContent=t;msg.classList.add('error');}};
    const ok=t=>{if(msg){msg.textContent=t;msg.classList.add('ok');}};
    if(kind==='lab'){
      const code=norm(form.elements.code?.value);
      if(!/^SG-\d{6}-\d{3}$/.test(code))return bad('批次号格式不对。请按 SG-YYMMDD-### 输入完整编号。');
      if(code!=='SG-060819-087')return bad('没有找到可公开查看的样片。请核对批次号。');
      localStorage.setItem(auth.lab,'1');ok('已找到公开活动批次，正在打开样片……');setTimeout(()=>location.href=form.dataset.success,250);return;
    }
    if(kind==='service'){
      const user=norm(form.elements.user?.value), pass=(form.elements.pass?.value||'').trim();
      if(!/^[A-Z]{2}\d{3}$/.test(user))return bad('用户名格式不对。');
      if(!/^\d{6}$/.test(pass))return bad('口令必须是6位数字。');
      if(user!=='KF017'||pass!=='200407')return bad('用户名或口令错误。归档镜像不会锁定账号。');
      localStorage.setItem(auth.service,'1');ok('验证通过，正在进入只读系统……');setTimeout(()=>location.href=form.dataset.success,250);return;
    }
    if(kind==='maintenance'){
      const w=norm(form.elements.workorder?.value),box=form.querySelector('.terminal-result');
      if(!/^WX-\d{6}$/.test(w))return bad('WORK ORDER 格式错误。');
      if(box){box.hidden=false;if(w==='WX-060724'){box.innerHTML='MATCH: C-MIRROR / REPAIR / 060724<br><a href="../maintenance/repairs.html">OPEN RECORD</a>';ok('1 match.');}else if(['WX-060721','WX-060818','WX-060814'].includes(w)){const map={'WX-060721':'A-RIDE / utility','WX-060818':'A-RIDE / train','WX-060814':'D-WATER + C-MIRROR cross-ref'};box.textContent='MATCH: '+map[w];ok('1 match.');}else{box.textContent='NO MATCH IN RECOVERED INDEX';bad('未在恢复索引中找到该编号。');}}return;
    }
    if(kind==='archive'){
      const a=norm(form.elements.archive?.value),box=form.querySelector('.archive-results');
      if(!/^CH-\d{2}-\d{3}-[A-Z]$/.test(a))return bad('档号格式不对。请按 CH-YY-###-X 输入。');
      if(a!=='CH-03-441-C')return bad('检索到的公开卷宗与当前条件不匹配，或该档号不存在。');
      localStorage.setItem(auth.archive,'1');if(box){box.hidden=false;box.innerHTML='<b>检索结果 1 条</b><br>CH-03-441-C　春灯游乐园C区排水与后场检修改造　2003　长期保存<br><a href="../archive/records.html">打开工程目录</a>　·　<a href="../archive/maps.html">图纸阅览</a>'; }ok('检索完成。');return;
    }
  }));


  /* voluntary 1 yuan support layer, adapted from the current Xu Yuan flow.
     It is completely separate from game state and never gates content. */
  const ChundengSupport={
    STORAGE_KEY:'_chundeng_support',
    SESSION_KEY:'_chundeng_support_session',
    COOKIE_KEY:'_chundeng_support_flag',
    AUTO_SEEN_KEY:'_chundeng_support_auto_seen',
    qrCode:'https://mike798-cloud.github.io/songtao-grainstation/paycode.png',
    _getCookie(name){
      try{const key=name+'=';for(const part of document.cookie.split(';')){const value=part.trim();if(value.indexOf(key)===0)return value.slice(key.length);}}catch(e){}
      return '';
    },
    _setCookie(name,value,days){
      try{const d=new Date();d.setTime(d.getTime()+days*86400000);document.cookie=name+'='+value+';expires='+d.toUTCString()+';path=/;SameSite=Lax';}catch(e){}
    },
    hasPaid(){
      try{return !!(localStorage.getItem(this.STORAGE_KEY)||sessionStorage.getItem(this.SESSION_KEY)||this._getCookie(this.COOKIE_KEY));}
      catch(e){return !!this._getCookie(this.COOKIE_KEY);}
    },
    hasAutoSeen(){try{return localStorage.getItem(this.AUTO_SEEN_KEY)==='1';}catch(e){return false;}},
    markAutoSeen(){try{localStorage.setItem(this.AUTO_SEEN_KEY,'1');}catch(e){}},
    markPaid(){
      const raw=Date.now()+'_'+Math.random().toString(36).slice(2,10)+'_chundeng';
      let token=raw;try{token=btoa(unescape(encodeURIComponent(raw)));}catch(e){}
      try{localStorage.setItem(this.STORAGE_KEY,token);sessionStorage.setItem(this.SESSION_KEY,token);}catch(e){}
      this._setCookie(this.COOKIE_KEY,token,365);
      document.body.classList.add('support-complete');
    },
    shouldShowChip(){
      const p=location.pathname.replace(/\\/g,'/');
      return /\/(lab|forum|service|maintenance|archive|demolition)\//.test(p) && !document.body.classList.contains('thanks-site');
    },
    ensureButton(){
      if(!this.shouldShowChip()||document.getElementById('chundengSupportButton'))return;
      const btn=document.createElement('button');btn.type='button';btn.id='chundengSupportButton';btn.className='chundeng-support-chip';btn.setAttribute('aria-label','支持作者 1元');
      btn.innerHTML='<span>￥</span><b>支持作者</b>';
      btn.addEventListener('click',()=>this.show({manual:true}));document.body.appendChild(btn);
      if(this.hasPaid())document.body.classList.add('support-complete');
    },
    show(options={}){
      if(this.hasPaid()){
        if(options.manual)this.toast('已经收到你的支持了，谢谢你。后面的调查照常看就好。');
        return;
      }
      let overlay=document.getElementById('chundengSupportOverlay');
      if(!overlay){
        overlay=document.createElement('div');overlay.className='chundeng-paywall-overlay';overlay.id='chundengSupportOverlay';
        overlay.innerHTML=`<section class="chundeng-paywall-card" role="dialog" aria-modal="true" aria-labelledby="chundengPayTitle">
          <button type="button" class="chundeng-paywall-close" aria-label="关闭">×</button>
          <div class="chundeng-paywall-inner">
            <header class="chundeng-paywall-head">
              <div class="chundeng-paywall-eyebrow">abc studio / voluntary support</div>
              <h2 id="chundengPayTitle">如果你愿意，支持《春灯闭园以后》1元</h2>
              <p>自愿支持，不影响完整游玩，也不会解锁额外内容。</p>
            </header>
            <div class="chundeng-paywall-body">
              <figure class="chundeng-paywall-qr"><img src="${this.qrCode}" alt="1元支持收款码"><figcaption>扫码支持 1 元</figcaption></figure>
              <div class="chundeng-paywall-copy">
                <p>你好，我是 abc。谢谢你愿意把这些旧新闻、冲印照片、论坛回复和工单一页页翻到这里。</p>
                <p>做这部作品的时候，我花了不少时间在那些看起来没什么用的东西上：退票单、失物记录、维修编号，还有很多当年根本没人当回事的小事。它们不一定都是线索，但少了这些，春灯就不像真的存在过。</p>
                <p>如果你觉得这趟调查值得，愿意留下一块钱，我会很开心；不方便也完全没关系，关掉这里继续往后查，后面的内容一页都不会少。</p>
                <p class="chundeng-paywall-line">这一块钱当然改不了二十年前的结果。对我来说，它只是说明真的有人把这些旧东西认真翻了下去。</p>
              </div>
            </div>
            <footer class="chundeng-paywall-foot">
              <button type="button" class="chundeng-paywall-done">我支持了一下</button>
              <button type="button" class="chundeng-paywall-later">继续调查</button>
            </footer>
          </div>
        </section>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.chundeng-paywall-close').addEventListener('click',()=>this.hide());
        overlay.querySelector('.chundeng-paywall-later').addEventListener('click',()=>this.hide());
        overlay.querySelector('.chundeng-paywall-done').addEventListener('click',()=>{this.markPaid();this.hide();this.toast('收到啦，谢谢你。后面照常往下查就好。');});
        overlay.addEventListener('click',event=>{if(event.target===overlay)this.hide();});
      }
      overlay.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('is-open')));
      overlay.querySelector('.chundeng-paywall-close')?.focus({preventScroll:true});
    },
    hide(){const overlay=document.getElementById('chundengSupportOverlay');if(!overlay)return;overlay.classList.remove('is-open');setTimeout(()=>{overlay.hidden=true;},360);},
    toast(text){const old=document.querySelector('.chundeng-support-toast');if(old)old.remove();const el=document.createElement('div');el.className='chundeng-support-toast';el.textContent=text;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),350);},3200);},
    init(){
      this.ensureButton();
      if(this.hasPaid()||this.hasAutoSeen())return;
      if(document.body.classList.contains('support-trigger')){
        const fire=()=>{if(this.hasPaid()||this.hasAutoSeen())return;if(document.hidden){const onVisible=()=>{if(document.hidden)return;document.removeEventListener('visibilitychange',onVisible);fire();};document.addEventListener('visibilitychange',onVisible);return;}this.markAutoSeen();this.show({auto:true});};
        setTimeout(fire,4800);
      }
    }
  };
  window.ChundengSupport=ChundengSupport;
  document.addEventListener('keydown',event=>{if(event.key==='Escape')ChundengSupport.hide();});
  ChundengSupport.init();

})();
