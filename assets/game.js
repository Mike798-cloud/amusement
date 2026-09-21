(function(){
  const seenKey='chundeng-visited';
  try{const path=location.pathname.split('/').filter(Boolean).slice(-2).join('/');let seen=JSON.parse(localStorage.getItem(seenKey)||'[]');if(path&&!seen.includes(path)){seen.push(path);localStorage.setItem(seenKey,JSON.stringify(seen));}}catch(e){}

  const auth={lab:'chundeng-lab-ok',service:'chundeng-service-ok',archive:'chundeng-archive-ok'};
  document.querySelectorAll('[data-gate]').forEach(el=>{const g=el.dataset.gate;if(auth[g]&&localStorage.getItem(auth[g])!=='1'){location.replace(el.dataset.gateRedirect||'index.html');}});

  document.querySelectorAll('[data-photo]').forEach(btn=>{btn.classList.add('photo-button');btn.addEventListener('click',()=>{const viewer=document.querySelector('.viewer');if(!viewer)return;viewer.querySelector('img').src=btn.querySelector('img').src;viewer.classList.add('open');});});
  document.querySelectorAll('.viewer').forEach(v=>{const close=()=>v.classList.remove('open');v.addEventListener('click',e=>{if(e.target===v)close()});const b=v.querySelector('button');if(b)b.addEventListener('click',close);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.viewer.open').forEach(v=>v.classList.remove('open'));});

  const mapButtons=document.querySelectorAll('[data-map]');
  if(mapButtons.length){const target=document.querySelector('#map-image');mapButtons.forEach(b=>b.addEventListener('click',()=>{mapButtons.forEach(x=>x.classList.remove('active'));b.classList.add('active');if(target){target.src=b.dataset.map;target.alt=b.textContent+'平面图';}const note=document.querySelector('#map-note');if(note)note.textContent=b.dataset.note||'';}));}
  const cr=document.querySelector('#compare-range'), ct=document.querySelector('#compare-top');if(cr&&ct){const stage=ct.parentElement, img=ct.querySelector('img');const sync=()=>{ct.style.width=cr.value+'%';if(stage&&img)img.style.width=stage.clientWidth+'px';};cr.addEventListener('input',sync);addEventListener('resize',sync);sync();}

  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;document.querySelectorAll('[data-record]').forEach(r=>{r.style.display=(f==='all'||r.dataset.record===f)?'table-row':'none';});}));

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
})();