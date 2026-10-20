/* ---------- Page navigation ---------- */
const pages = ['home','summary','skills','experience','projects','education','certs','contact'];
let currentPage = 'home';

function goToPage(id){
  if(!pages.includes(id)) return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===id));
  document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('active', d.dataset.page===id));
  currentPage = id;
}
document.querySelectorAll('[data-page]').forEach(el=>{
  el.addEventListener('click', ()=> goToPage(el.dataset.page));
});
goToPage('home');

/* ---------- copy email fallback ---------- */
const copyBtn = document.getElementById('copyEmailBtn');
if(copyBtn){
  copyBtn.addEventListener('click', async (e)=>{
    e.stopPropagation();
    const email = 'chchaitu0505@gmail.com';
    try{
      await navigator.clipboard.writeText(email);
    }catch(err){
      const ta = document.createElement('textarea');
      ta.value = email; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>{ copyBtn.textContent = original; }, 1800);
  });
}

/* ---------- stat count-up (runs once on first summary visit) ---------- */
let statsAnimated = false;
const origGoToPage = goToPage;
goToPage = function(id){
  origGoToPage(id);
  if(id==='summary' && !statsAnimated){
    statsAnimated = true;
    document.querySelectorAll('.stat-tile .num').forEach(el=>{
      const raw = el.textContent.trim();
      const target = parseFloat(raw);
      const isFloat = raw.includes('.');
      let start = null; const dur = 800;
      function step(ts){
        if(!start) start = ts;
        const p = Math.min((ts-start)/dur, 1);
        el.textContent = isFloat ? (target*p).toFixed(2) : Math.round(target*p);
        if(p<1) requestAnimationFrame(step); else el.textContent = raw;
      }
      requestAnimationFrame(step);
    });
  }
};

/* ---------- 3D scenes, one per page ---------- */
(function(){
  if(!window.THREE) return;
  const accent = 0x3454d1, accent2 = 0x0e9488, accent3 = 0xc9922f;
  const scenes = {};

  function wireMat(color, opacity){
    return new THREE.MeshBasicMaterial({color, wireframe:true, transparent:true, opacity});
  }

  function fullBase(canvasId){
    const canvas = document.getElementById(canvasId);
    if(!canvas) return null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    return {canvas, scene, camera, renderer, full:true};
  }

  function boxBase(canvasId){
    const canvas = document.getElementById(canvasId);
    if(!canvas) return null;
    const container = canvas.parentElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 6;
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    function resize(){
      const w = container.clientWidth, h = container.clientHeight;
      if(w===0||h===0) return;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    }
    resize();
    window.addEventListener('resize', resize);
    return {canvas, scene, camera, renderer, full:false};
  }

  // HOME (boxed visual)
  (function(){
    const s = boxBase('canvas-home-box'); if(!s) return;
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,0), wireMat(accent,0.65));
    ico.position.set(-0.5,0.2,0); s.scene.add(ico);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.65,0.2,10,40), wireMat(accent2,0.6));
    torus.position.set(1.2,-0.4,-1); s.scene.add(torus);
    s.update=()=>{ico.rotation.x+=0.004;ico.rotation.y+=0.006;torus.rotation.x+=0.005;torus.rotation.y+=0.003;};
    scenes.home=s;
  })();

  // SUMMARY
  (function(){
    const s = fullBase('canvas-summary'); if(!s) return;
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1), wireMat(accent,0.18));
    sphere.position.set(0,0,-2); s.scene.add(sphere);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,0), wireMat(accent2,0.16));
    inner.position.set(0,0,-2); s.scene.add(inner);
    s.update=()=>{sphere.rotation.y+=0.0018;sphere.rotation.x+=0.001;inner.rotation.y-=0.0024;inner.rotation.x-=0.0014;};
    scenes.summary=s;
  })();

  // SKILLS
  (function(){
    const s = fullBase('canvas-skills'); if(!s) return;
    const colors=[accent,accent2,accent3,accent];
    const cubes=[];
    for(let i=0;i<4;i++){
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.85,0.85,0.85), wireMat(colors[i],0.25));
      cube.position.set(-3.3 + i*2.2, Math.sin(i)*0.5, -2);
      s.scene.add(cube); cubes.push(cube);
    }
    s.update=(t)=>{cubes.forEach((c,i)=>{c.rotation.x+=0.004+i*0.0005;c.rotation.y+=0.006;c.position.y=Math.sin(t*0.0007+i)*0.4;});};
    scenes.skills=s;
  })();

  // EXPERIENCE
  (function(){
    const s = fullBase('canvas-experience'); if(!s) return;
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.25,0.3,100,12), wireMat(accent2,0.2));
    knot.position.set(1.5,0,-3); s.scene.add(knot);
    s.update=()=>{knot.rotation.x+=0.0028;knot.rotation.y+=0.0038;};
    scenes.experience=s;
  })();

  // PROJECTS
  (function(){
    const s = fullBase('canvas-projects'); if(!s) return;
    const group = new THREE.Group();
    const pts = [[-2,1,-2],[2,0.6,-3],[0,-1.4,-2.5]];
    const nodes = pts.map(p=>{
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38,0), wireMat(accent,0.3));
      m.position.set(p[0],p[1],p[2]); group.add(m); return m;
    });
    const lineMat = new THREE.LineBasicMaterial({color:accent2, transparent:true, opacity:0.22});
    for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
      const geo = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
      group.add(new THREE.Line(geo, lineMat));
    }
    s.scene.add(group);
    s.update=()=>{group.rotation.y+=0.002;group.rotation.x+=0.0008;};
    scenes.projects=s;
  })();

  // EDUCATION
  (function(){
    const s = fullBase('canvas-education'); if(!s) return;
    const group = new THREE.Group();
    [0.7,0.9,1.1].forEach((sz,i)=>{
      const cube = new THREE.Mesh(new THREE.BoxGeometry(sz,sz,sz), wireMat(accent,0.18));
      cube.position.set(-2+i*2, -1+i*0.9, -2.5);
      group.add(cube);
    });
    s.scene.add(group);
    s.update=()=>{group.rotation.y+=0.0016;};
    scenes.education=s;
  })();

  // CERTS
  (function(){
    const s = fullBase('canvas-certs'); if(!s) return;
    const group = new THREE.Group();
    const orbiters=[];
    for(let i=0;i<5;i++){
      const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.3,0), wireMat(i%2===0?accent:accent2,0.3));
      orbiters.push(o); group.add(o);
    }
    group.position.set(0,0,-2.5);
    s.scene.add(group);
    s.update=(t)=>{orbiters.forEach((o,i)=>{const a=t*0.0006+(i/orbiters.length)*Math.PI*2;o.position.set(Math.cos(a)*2.1,Math.sin(a)*1.05,Math.sin(a*2)*0.5);o.rotation.x+=0.01;o.rotation.y+=0.01;});};
    scenes.certs=s;
  })();

  // CONTACT
  (function(){
    const s = fullBase('canvas-contact'); if(!s) return;
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,0), wireMat(accent,0.2));
    ico.position.set(0,0,-2.5); s.scene.add(ico);
    s.update=(t)=>{ico.rotation.y+=0.0028;ico.rotation.x+=0.0015;const sc=1+Math.sin(t*0.0012)*0.05;ico.scale.set(sc,sc,sc);};
    scenes.contact=s;
  })();

  window.addEventListener('resize', ()=>{
    Object.values(scenes).forEach(s=>{
      if(!s.full) return;
      s.camera.aspect = window.innerWidth/window.innerHeight;
      s.camera.updateProjectionMatrix();
      s.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });

  function animate(t){
    requestAnimationFrame(animate);
    // always render the boxed home visual since it's visible within page-home
    if(scenes.home){ if(scenes.home.update) scenes.home.update(t||0); scenes.home.renderer.render(scenes.home.scene, scenes.home.camera); }
    const s = scenes[currentPage];
    if(s && s.full){
      if(s.update) s.update(t||0);
      s.renderer.render(s.scene, s.camera);
    }
  }
  animate();
})();

/* ---------- resume upload (drag & drop, remove) ---------- */
(function(){
  const input    = document.getElementById('resumeInput');
  if(!input) return;
  const dropEl   = document.getElementById('resumeDrop');
  const fileEl   = document.getElementById('resumeFile');
  const nameEl   = document.getElementById('resumeName');
  const metaEl   = document.getElementById('resumeMeta');
  const statusEl = document.getElementById('resumeStatus');
  const barEl    = document.getElementById('resumeBar');
  const dlEl     = document.getElementById('resumeDownload');
  const removeEl = document.getElementById('resumeRemove');
  const msgEl    = document.getElementById('resumeMsg');

  const DB_NAME = 'portfolioDB', STORE = 'files', KEY = 'resume';
  const MAX_BYTES = 10 * 1024 * 1024;
  let current = null;     // { name, size, date, blob }
  let objectUrl = null;
  let msgTimer = null;
  let runId = 0;

  /* storage is best-effort: the UI works even if the browser blocks it */
  function openDB(){
    return new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = ()=> req.result.createObjectStore(STORE);
        req.onsuccess = ()=> resolve(req.result);
        req.onerror = ()=> reject(req.error);
      }catch(err){ reject(err); }
    });
  }
  async function run(mode, action){
    const db = await openDB();
    return new Promise((resolve, reject)=>{
      const t = db.transaction(STORE, mode);
      const req = action(t.objectStore(STORE));
      t.oncomplete = ()=>{ db.close(); resolve(req.result); };
      t.onerror = t.onabort = ()=>{ db.close(); reject(t.error); };
    });
  }

  function formatSize(bytes){
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return Math.round(bytes/1024) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  }
  function showMsg(text, isError){
    msgEl.textContent = text;
    msgEl.classList.toggle('error', !!isError);
    clearTimeout(msgTimer);
    if(text) msgTimer = setTimeout(()=>{ msgEl.textContent = ''; }, 4000);
  }

  function render(animate){
    if(objectUrl){ URL.revokeObjectURL(objectUrl); objectUrl = null; }
    if(!current){
      dropEl.hidden = false;
      fileEl.hidden = true;
      return;
    }
    objectUrl = URL.createObjectURL(current.blob);
    dlEl.href = objectUrl;
    dlEl.setAttribute('download', current.name);
    nameEl.textContent = current.name;
    metaEl.textContent = formatSize(current.size);
    dropEl.hidden = true;
    fileEl.hidden = false;

    const myRun = ++runId;
    barEl.style.transition = 'none';
    barEl.style.width = animate ? '0%' : '100%';
    statusEl.classList.remove('done');
    if(!animate){
      statusEl.textContent = 'Uploaded';
      statusEl.classList.add('done');
      return;
    }
    statusEl.textContent = 'Uploading...';
    void barEl.offsetWidth;
    barEl.style.transition = 'width .8s ease';
    barEl.style.width = '100%';
    setTimeout(()=>{
      if(myRun !== runId) return;
      statusEl.textContent = 'Uploaded';
      statusEl.classList.add('done');
    }, 850);
  }

  async function handleFile(file){
    if(!file) return;
    if(!/\.(pdf|docx?)$/i.test(file.name)){
      showMsg('Please choose a PDF or Word file (.pdf, .doc, .docx).', true);
      return;
    }
    if(file.size > MAX_BYTES){
      showMsg('That file is over 10 MB. Please choose a smaller one.', true);
      return;
    }
    current = { name:file.name, size:file.size, date:Date.now(), blob:file };
    render(true);
    try{
      await run('readwrite', s=> s.put(current, KEY));
    }catch(err){
      showMsg('Added for this visit only. This browser blocked saving it.', true);
    }
  }

  function removeFile(){
    current = null;
    runId++;
    render(false);
    showMsg('Resume removed.');
    run('readwrite', s=> s.delete(KEY)).catch(()=>{});
  }

  /* open the file picker from the drop zone */
  dropEl.addEventListener('click', ()=> input.click());
  dropEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', ()=>{
    const file = input.files && input.files[0];
    input.value = '';
    handleFile(file);
  });

  /* drag & drop */
  ['dragenter','dragover'].forEach(evt=>{
    dropEl.addEventListener(evt, (e)=>{ e.preventDefault(); dropEl.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    dropEl.addEventListener(evt, (e)=>{ e.preventDefault(); dropEl.classList.remove('dragover'); });
  });
  dropEl.addEventListener('drop', (e)=>{
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });
  /* a missed drop should not make the browser open the file */
  window.addEventListener('dragover', (e)=> e.preventDefault());
  window.addEventListener('drop', (e)=> e.preventDefault());

  removeEl.addEventListener('click', removeFile);

  /* restore a previously saved resume */
  run('readonly', s=> s.get(KEY)).then(rec=>{
    if(rec && rec.blob && !current){ current = rec; render(false); }
  }).catch(()=>{});
})();
