let motionPlayer=null;
function motionPanel(c){
 const formulas=[c.algorithm,...c.alternatives];
 return `<section class="motion-panel" id="motion-panel" aria-labelledby="motion-title"><div class="motion-heading"><span class="icon-tile">${icon('box')}</span><div><h2 id="motion-title">Xem xoay 3D</h2><p>Quy ước màu: vàng trên · trắng dưới.</p></div><button type="button" class="icon-btn motion-fullscreen" id="motion-fullscreen" aria-label="Toàn màn hình mô phỏng 3D" aria-pressed="false" title="Toàn màn hình">${icon('maximize')}</button></div><div class="motion-choice"><label class="motion-label">Công thức mô phỏng<select id="motion-formula">${formulas.map((a,i)=>`<option value="${i}" ${!a?'disabled':''}>${i===0?'Công thức chính':c.reference?.algorithm===a?'Cách 2 · J Perm':'Biến thể '+i}</option>`).join('')}</select></label><code class="motion-formula" id="motion-alg">${esc(c.algorithm)}</code></div><div class="motion-stage" id="motion-stage"><div class="motion-placeholder">${icon('rotate-3d')}<p>Kéo mô hình để đổi góc nhìn.<br>Dùng nút từng bước để theo dõi động tác.</p></div></div><p class="motion-status" id="motion-status" role="status" aria-live="polite">${c.algorithm?'Sẵn sàng tải mô phỏng.':'Nguồn chưa có công thức để mô phỏng.'}</p><button class="btn primary motion-load" id="motion-load" ${!c.algorithm?'disabled':''}>${icon('play')} Mở mô phỏng 3D</button><div id="motion-controls" hidden><div class="motion-buttons"><button class="btn" id="motion-reset" aria-label="Về đầu công thức">${icon('rotate-ccw')}</button><button class="btn" id="motion-prev" aria-label="Bước trước">${icon('skip-back')}</button><button class="btn primary" id="motion-play">Phát</button><button class="btn" id="motion-next" aria-label="Bước tiếp theo">${icon('skip-forward')}</button></div><label class="motion-label">Tốc độ<select id="motion-speed"><option value="0.25">0,25× · Rất chậm</option><option value="0.5">0,5× · Chậm</option><option value="0.75" selected>0,75× · Dễ theo dõi</option><option value="1">1× · Bình thường</option><option value="1.5">1,5× · Nhanh</option></select></label><label class="motion-label">Vị trí trong công thức<input id="motion-position" type="range" min="0" max="1" value="0" step="1"></label><div id="motion-steps" class="motion-steps" aria-label="Các bước xoay"></div></div><p class="motion-note">${c.puzzle==='sq1'&&c.method==='EP'?'Trạng thái đầu EP được dựng ngược từ khối đã giải, gồm cả tầng giữa. Chạy hết công thức sẽ hoàn thành 6 mặt, vàng trên và trắng dưới.':c.puzzle==='sq1'?'Square-1 đổi hình theo từng góc 30° và lát cắt 180°. Trạng thái đầu là một trường hợp hợp lệ được dựng ngược từ dạng vuông; màu sticker có thể khác ảnh nhận diện.':'Trạng thái đầu được dựng bằng công thức đảo để kết thúc ở khối đã giải. Với bài giải một phần, các sticker ngoài phạm vi case có thể khác ảnh nguồn.'} Mô phỏng động tác, không mô phỏng cách đặt ngón tay.</p><p class="motion-source">${c.puzzle==='sq1'?'Square-1 · Three.js':'Mô phỏng bằng <a href="https://js.cubing.net/cubing/twisty/" target="_blank" rel="noopener">cubing.js</a>'}</p></section>`;
}
function mountMotion(c){
 motionPlayer?.dispose();motionPlayer=null;
 const root=document.getElementById('motion-panel');if(!root)return;
 const fullscreenButton=root.querySelector('#motion-fullscreen');
 let expandedFallback=false,fullscreenBusy=false,placeholder=null,previousOverflow='',inertElements=[];
 const expanded=()=>expandedFallback||document.fullscreenElement===root;
 function syncFullscreen(){
  const active=expanded();fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.setAttribute('aria-label',active?'Thoát toàn màn hình mô phỏng 3D':'Toàn màn hình mô phỏng 3D');
  fullscreenButton.title=active?'Thoát toàn màn hình (Esc)':'Toàn màn hình';
  fullscreenButton.innerHTML=icon(active?'minimize':'maximize');hydrate();
 }
 function leaveFallback(restoreFocus=true){
  if(!expandedFallback)return;expandedFallback=false;root.classList.remove('motion-expanded');
  root.removeAttribute('role');root.removeAttribute('aria-modal');
  placeholder?.replaceWith(root);placeholder=null;document.body.style.overflow=previousOverflow;
  for(const [element,value] of inertElements)element.inert=value;inertElements=[];
  syncFullscreen();if(restoreFocus)fullscreenButton.focus({preventScroll:true});
 }
 function enterFallback(){
  previousOverflow=document.body.style.overflow;placeholder=document.createComment('motion-panel-position');root.before(placeholder);
  document.body.appendChild(root);expandedFallback=true;root.classList.add('motion-expanded');
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');document.body.style.overflow='hidden';
  inertElements=[...document.body.children].filter(el=>el!==root).map(el=>[el,el.inert]);for(const [el] of inertElements)el.inert=true;
  syncFullscreen();fullscreenButton.focus({preventScroll:true});
 }
 async function toggleFullscreen(){
  if(fullscreenBusy)return;fullscreenBusy=true;fullscreenButton.disabled=true;
  try{
   if(expandedFallback)leaveFallback();
   else if(document.fullscreenElement===root)await document.exitFullscreen();
   else {
    try{if(!root.requestFullscreen||!document.fullscreenEnabled)throw Error();await root.requestFullscreen();}
    catch{enterFallback();}
   }
  }catch{toast('Chưa thể thoát toàn màn hình. Anh có thể nhấn Esc.');}
  finally{fullscreenBusy=false;fullscreenButton.disabled=false;syncFullscreen();}
 }
 const onFullscreenChange=()=>{syncFullscreen();if(!document.fullscreenElement)fullscreenButton.focus({preventScroll:true});};
 function fullscreenKeys(event){
  if(!expanded())return;
  if(event.key==='Escape'){
   event.preventDefault();event.stopPropagation();
   if(expandedFallback)leaveFallback();else document.exitFullscreen().catch(()=>{});
   return;
  }
  if(event.key!=='Tab')return;
  const items=[...root.querySelectorAll('button,select,input,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }
 fullscreenButton.onclick=toggleFullscreen;document.addEventListener('fullscreenchange',onFullscreenChange);document.addEventListener('keydown',fullscreenKeys,true);
 const select=root.querySelector('#motion-formula'),status=root.querySelector('#motion-status'),load=root.querySelector('#motion-load'),controls=root.querySelector('#motion-controls');
 const formulas=[c.algorithm,...c.alternatives];let generation=0,current=0,total=0,playing=false,busy=false,lastUpdate='';
 function update(state){
  const key=[state.index,state.total,state.playing,state.solved].join(':');if(key===lastUpdate)return;lastUpdate=key;
  current=state.index;total=state.total;playing=state.playing;
  root.querySelector('#motion-position').value=current;
  root.querySelector('#motion-play').textContent=playing?'Tạm dừng':current===total?'Phát lại':'Phát';
  root.querySelector('#motion-prev').disabled=current===0;
  root.querySelector('#motion-next').disabled=current===total;
  status.textContent=`${playing?'Đang phát':'Đã dừng'} · Bước ${current} / ${total}${state.solved?' · Hoàn thành 6 mặt':''}`;
  root.querySelectorAll('[data-motion-step]').forEach((b,i)=>{b.classList.toggle('active',i===current);if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 }
 async function open(){
  if(busy)return;busy=true;const token=++generation;
  motionPlayer?.dispose();motionPlayer=null;lastUpdate='';controls.hidden=true;load.disabled=true;select.disabled=true;
  status.textContent='Đang tải mô phỏng 3D…';root.querySelector('#motion-stage').setAttribute('aria-busy','true');
  try{
   const text=formulas[Number(select.value)];if(!text)throw new Error('Case chưa có công thức.');
   const module=await import((c.puzzle==='sq1'?'/vendor/simulator/square1.js':'/vendor/simulator/cube.js')+'?v=20261028-ep-six-faces');
   if(token!==generation||!root.isConnected)return;
   const player=c.puzzle==='sq1'?await module.createSquarePlayer(root.querySelector('#motion-stage'),text,update,{fullySolved:c.method==='EP'}):await module.createCubePlayer(root.querySelector('#motion-stage'),text,c.puzzle,update);
   if(token!==generation||!root.isConnected){player.dispose();return;}
   motionPlayer=player;total=player.steps.length;root.querySelector('#motion-position').max=total;
   root.querySelector('#motion-steps').innerHTML=player.steps.map((step,i)=>`<button type="button" data-motion-step="${i}" aria-label="Đến bước ${i+1}: ${esc(step)}">${esc(step)}</button>`).join('');
   root.querySelectorAll('[data-motion-step]').forEach(b=>b.onclick=()=>motionPlayer.seek(Number(b.dataset.motionStep)));
   player.speed(Number(root.querySelector('#motion-speed').value));controls.hidden=false;load.hidden=true;update({index:0,total,playing:false});
  }catch(e){status.textContent='Không mở được mô phỏng: '+e.message;load.hidden=false;load.textContent='Thử lại mô phỏng';root.querySelector('#motion-stage').replaceChildren();}
  finally{busy=false;load.disabled=false;select.disabled=false;root.querySelector('#motion-stage').removeAttribute('aria-busy');}
 }
 load.onclick=open;
 select.onchange=()=>{root.querySelector('#motion-alg').textContent=formulas[Number(select.value)];if(motionPlayer||load.textContent.includes('Thử lại'))open();};
 root.querySelector('#motion-play').onclick=()=>playing?motionPlayer.pause():motionPlayer.play();
 root.querySelector('#motion-reset').onclick=()=>{motionPlayer.seek(0);motionPlayer.resetView?.();};
 root.querySelector('#motion-prev').onclick=()=>motionPlayer.seek(current-1);
 root.querySelector('#motion-next').onclick=()=>motionPlayer.seek(current+1);
 root.querySelector('#motion-position').oninput=e=>motionPlayer.seek(Number(e.target.value));
 root.querySelector('#motion-speed').onchange=e=>motionPlayer.speed(Number(e.target.value));
 document.querySelectorAll('[data-motion-index]').forEach(b=>b.onclick=()=>{if(busy)return;select.value=b.dataset.motionIndex;root.querySelector('#motion-alg').textContent=formulas[Number(select.value)];root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});open();});
 const onVisibility=()=>{if(document.hidden)motionPlayer?.pause();};
 document.addEventListener('visibilitychange',onVisibility);
 window.addEventListener('pagehide',()=>{generation++;leaveFallback(false);document.removeEventListener('fullscreenchange',onFullscreenChange);document.removeEventListener('keydown',fullscreenKeys,true);motionPlayer?.dispose();motionPlayer=null;document.removeEventListener('visibilitychange',onVisibility);},{once:true});
}
