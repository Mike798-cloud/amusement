(function(){
  const key='chundeng-visited';
  try{
    const path=location.pathname.split('/').filter(Boolean).slice(-2).join('/');
    let seen=JSON.parse(localStorage.getItem(key)||'[]');
    if(path && !seen.includes(path)){seen.push(path);localStorage.setItem(key,JSON.stringify(seen));}
  }catch(e){}

  document.querySelectorAll('[data-photo]').forEach(btn=>{
    btn.classList.add('photo-button');
    btn.addEventListener('click',()=>{
      const viewer=document.querySelector('.viewer');
      if(!viewer) return;
      viewer.querySelector('img').src=btn.querySelector('img').src;
      viewer.classList.add('open');
    });
  });
  document.querySelectorAll('.viewer').forEach(v=>{
    const close=()=>v.classList.remove('open');
    v.addEventListener('click',e=>{if(e.target===v)close()});
    const b=v.querySelector('button'); if(b)b.addEventListener('click',close);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.viewer.open').forEach(v=>v.classList.remove('open'));});

  const mapButtons=document.querySelectorAll('[data-map]');
  if(mapButtons.length){
    const target=document.querySelector('#map-image');
    mapButtons.forEach(b=>b.addEventListener('click',()=>{
      mapButtons.forEach(x=>x.classList.remove('active')); b.classList.add('active');
      target.src=b.dataset.map; target.alt=b.textContent+'平面图';
      const note=document.querySelector('#map-note');
      if(note) note.textContent=b.dataset.note||'';
    }));
  }

  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    const f=b.dataset.filter; document.querySelectorAll('[data-record]').forEach(r=>{
      r.style.display=(f==='all'||r.dataset.record===f)?'table-row':'none';
    });
  }));
})();
