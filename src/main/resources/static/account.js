"use strict";
let socialProviders=[], currentUser=null, csrfState=null, roadmapData=null, personalWrite=Promise.resolve(), personalBusy=false;
const levelLabels={BEGINNER:'Mới bắt đầu',INTERMEDIATE:'Đã biết giải',ADVANCED:'Nâng cao'};
async function apiCall(url,options={}) {
  const method=options.method||'GET';
  const headers={Accept:'application/json',...options.headers};
  if(currentUser&&!url.startsWith('/api/auth/'))headers['X-Academy-Account']=currentUser.id;
  if(!['GET','HEAD'].includes(method)){
    if(!csrfState){const r=await fetch('/api/auth/csrf',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('Không thể tạo phiên bảo mật. Vui lòng tải lại trang.');csrfState=await r.json();}
    headers[csrfState.headerName]=csrfState.token;
  }
  const response=await fetch(url,{...options,method,headers,credentials:'same-origin',cache:'no-store'});
  const value=response.status===204?null:await response.json().catch(()=>({message:'Không thể xử lý yêu cầu. Vui lòng thử lại.'}));
  if(!response.ok){
    if(response.status===401&&currentUser&&!url.startsWith('/api/auth/')){currentUser=null;progress={};history=[];location.assign('/login?next='+encodeURIComponent(location.pathname+location.search));}
    if(response.status===403)csrfState=null;
    throw Error(value?.message||'Yêu cầu không thành công. Vui lòng thử lại.');
  }
  return value;
}
const jsonOptions=(method,value)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
function progressMap(rows){return Object.fromEntries(rows.map(p=>[p.algorithmId,{learned:p.learned,favorite:p.favorite,review:p.review,updatedAt:p.updatedAt}]));}
async function loadIdentity(){
  const [identity,providers]=await Promise.all([apiCall('/api/auth/me'),apiCall('/api/auth/providers')]);socialProviders=providers;currentUser=identity.authenticated?identity.user:null;
  if(currentUser){progress=progressMap(await apiCall('/api/progress'));history=store.get('history-'+currentUser.id,[]);}
  else {progress=store.get('progress',{});history=store.get('history',[]);}
  renderIdentity();
}
function renderIdentity(){
  const initial=currentUser?.displayName?.trim().slice(0,1).toUpperCase()||'K';
  $('#account-nav').innerHTML=currentUser?`<a href="/roadmap" data-nav="roadmap">${icon('route')}Lộ trình của tôi</a><a href="/study" data-nav="study">${icon('brain')}Ôn tập thông minh</a><a href="/study-stats","/timer" data-nav="study-stats">${icon('chart-no-axes-combined')}Thống kê luyện tập</a>${currentUser.role==='ADMIN'?`<a href="/admin" data-nav="admin">${icon('shield-check')}Quản lý người học</a>`:''}`:'';
  $('#profile-slot').innerHTML=`<a class="profile" href="${currentUser?'/account':'/login'}"><span class="avatar">${esc(initial)}</span><span><strong>${esc(currentUser?.displayName||'Học với tài khoản')}</strong><small>${currentUser?'Tiến độ lưu theo tài khoản':'Đăng nhập để lưu tiến độ'}</small></span>${icon(currentUser?'cloud-upload':'log-in')}</a>`;
  $('#account-slot').innerHTML=`<a class="account-link" href="${currentUser?'/account':'/login'}" aria-label="${currentUser?'Tài khoản của tôi':'Đăng nhập'}">${currentUser?`<span class="avatar small">${esc(initial)}</span>`:`${icon('log-in')}<span>Đăng nhập</span>`}</a>`;
}
function safeNext(fallback='/roadmap'){
  const value=params.get('next');if(!value)return fallback;
  try{const url=new URL(value,location.origin);if(url.origin!==location.origin)return fallback;if(!['/','/account','/roadmap','/progress','/practice','/favorites','/admin','/study','/study-stats','/timer','/algorithms'].includes(url.pathname)&&!/^\/algorithms\/[a-z0-9-]+$/.test(url.pathname))return fallback;return url.pathname+url.search+url.hash;}catch{return fallback;}
}
function authPage(register=false){
  if(currentUser){location.replace('/account');return;}
  $('#main').innerHTML=`<section class="auth-layout"><div class="auth-intro"><span class="eyebrow">${icon('box')} SPEEDCUBE ACADEMY</span><h1>${register?'Mỗi lần học đều được ghi nhớ.':'Tiếp tục hành trình của bạn.'}</h1><p>Lưu công thức đã thuộc, chọn lộ trình phù hợp và tiếp tục trên thiết bị khác.</p><div class="auth-benefit">${icon('route')} Lộ trình theo trình độ và loại Rubik</div><div class="auth-benefit">${icon('cloud-upload')} Tiến độ riêng cho từng tài khoản</div><a class="text-link" href="/algorithms">Khám phá thư viện trước ${icon('arrow-right')}</a></div><form class="account-form auth-form" id="auth-form"><span class="badge">${register?'TÀI KHOẢN MỚI':'CHÀO MỪNG TRỞ LẠI'}</span><h2>${register?'Tạo tài khoản':'Đăng nhập'}</h2>${params.has('socialError')?`<p class="form-error" role="alert">${esc(socialError(params.get('socialError')))}</p>`:''}${socialSignInButtons(register)}${register?'<label class="field"><span>Tên hiển thị</span><input name="displayName" autocomplete="nickname" required minlength="2" maxlength="60" placeholder="Tên của bạn"></label>':''}<label class="field"><span>Email</span><input type="email" name="email" autocomplete="username" required maxlength="254" placeholder="ban@example.com"></label><label class="field"><span>Mật khẩu</span><input type="password" name="password" autocomplete="${register?'new-password':'current-password'}" required ${register?'minlength="10" maxlength="72"':''} aria-describedby="password-help"></label><p id="password-help" class="form-help">${register?'Tối thiểu 10 ký tự, tối đa 72 byte UTF-8.':'Dùng email và mật khẩu bạn đã đăng ký.'}</p><p class="form-error" id="form-error" role="alert" hidden></p><button class="btn primary" type="submit">${register?'Tạo tài khoản & bắt đầu':'Đăng nhập'} ${icon('arrow-right')}</button><p>${register?'Đã có tài khoản?':'Chưa có tài khoản?'} <a class="text-link" href="/${register?'login':'register'}${params.get('next')?'?next='+encodeURIComponent(safeNext()):''}">${register?'Đăng nhập':'Đăng ký'}</a></p><a href="/" class="form-help">Tiếp tục khám phá với tư cách khách</a></form></section>`;
  $('#auth-form').onsubmit=async event=>{
    event.preventDefault();const form=event.currentTarget,button=$('button[type=submit]',form),error=$('#form-error');button.disabled=true;error.hidden=true;
    const fields=new FormData(form),email=String(fields.get('email')).trim().toLowerCase(),password=String(fields.get('password'));
    try{
      if(register){if(new TextEncoder().encode(password).length>72)throw Error('Mật khẩu tối đa 72 byte UTF-8.');await apiCall('/api/auth/register',jsonOptions('POST',{email,password,displayName:fields.get('displayName')}));}
      await apiCall('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password}).toString()});
      csrfState=null;form.reset();location.assign(safeNext(register?'/account?welcome=1':'/roadmap'));
    }catch(e){error.textContent=e.message;error.hidden=false;button.disabled=false;}
  };hydrate();
}
function guestProgressBanner(){return currentUser?`<section class="account-banner"><div>${icon('cloud-upload')} <strong>Tiến độ của ${esc(currentUser.displayName)}</strong><p>Đã lưu theo tài khoản. Đăng nhập để tiếp tục trên thiết bị khác.</p></div><a class="btn" href="/roadmap">Lộ trình của tôi ${icon('arrow-right')}</a></section>`:`<section class="account-banner"><div>${icon('log-in')} <strong>Đăng nhập để lưu tiến độ lâu dài</strong><p>Bạn đang học với tư cách khách. Tiến độ chỉ lưu trong trình duyệt này.</p></div><a class="btn primary" href="/login?next=%2Fprogress">Đăng nhập</a></section>`;}
function personalHome(){
  if(!currentUser)return;
  const slot=document.createElement('section');slot.className='account-banner';slot.innerHTML=`<div><span class="badge">LỘ TRÌNH CÁ NHÂN</span><h2>Chào ${esc(currentUser.displayName)}, hôm nay mình học gì?</h2><p>${esc(levelLabels[currentUser.level])} · ${esc(puzzleName(currentUser.focusPuzzle))} · Mục tiêu ${currentUser.dailyMinutes} phút/ngày</p></div><a class="btn primary" href="/roadmap">Tiếp tục lộ trình ${icon('arrow-right')}</a>`;
  $('.hero')?.after(slot);
}
function accountPage(){
 if(!currentUser){location.replace('/login?next=%2Faccount');return;}
 const guest=store.get('progress',{}),guestCount=Object.keys(guest).filter(id=>data.some(c=>c.id===id)).length;
 $('#main').innerHTML=crumb([['Tài khoản của tôi']])+title('Một hồ sơ. Một hành trình riêng.','Chọn trình độ và loại Rubik để xây dựng lộ trình phù hợp.')+`<div class="account-grid"><form class="account-form" id="profile-form"><h2>Hồ sơ học tập</h2><label class="field"><span>Tên hiển thị</span><input name="displayName" value="${esc(currentUser.displayName)}" required minlength="2" maxlength="60" autocomplete="nickname"></label><label class="field"><span>Email đăng nhập</span><input value="${esc(currentUser.email)}" readonly type="email"></label><label class="field"><span>Trình độ hiện tại</span><select name="level">${Object.entries(levelLabels).map(([id,label])=>`<option value="${id}" ${currentUser.level===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span>Rubik đang tập trung</span><select name="focusPuzzle">${puzzleCodes().map(id=>`<option value="${id}" ${currentUser.focusPuzzle===id?'selected':''}>${esc(puzzleName(id))}</option>`).join('')}</select></label><label class="field"><span>Mục tiêu luyện mỗi ngày (phút)</span><input name="dailyMinutes" type="number" min="5" max="120" value="${currentUser.dailyMinutes}" required></label><p class="form-help">Mục tiêu dùng để nhắc nhịp học, chưa phải bộ đếm thời gian thực hành. Đổi lộ trình vẫn giữ toàn bộ case đã thuộc.</p><p class="form-error" id="profile-error" role="alert" hidden></p><p id="profile-status" role="status"></p><button class="btn primary" type="submit">${icon('save')} Lưu hồ sơ</button></form><div><section class="guide-box"><span class="badge">${currentUser.role==='ADMIN'?'QUẢN TRỊ VIÊN':'NGƯỜI CHƠI'}</span><h2>${esc(currentUser.displayName)}</h2><p>Tiến độ học, case đã lưu và các chặng hoàn thành thuộc riêng tài khoản này.</p><div class="actions"><a class="btn primary" href="/roadmap">${icon('route')} Mở lộ trình</a><a class="btn" href="/progress">Xem tiến độ</a></div></section>${guestCount?`<section class="guide-box" id="guest-import-box"><h3>Tiến độ khách trên thiết bị này</h3><p>Có ${guestCount} mục chưa gắn tài khoản. Chỉ nhập nếu đây là dữ liệu học của bạn. Case đã thuộc trên tài khoản được giữ nguyên.</p><button class="btn" id="claim-guest">${icon('upload')} Nhập vào tài khoản của tôi</button><p id="guest-import-status" role="status"></p></section>`:''}<section class="guide-box"><h3>Google & Facebook</h3><p>Liên kết khi đang đăng nhập để tiếp tục dùng cùng hồ sơ và tiến độ. Yêu cầu vừa đăng nhập trong 10 phút gần đây.</p>${params.get('social')==='linked'?'<p class="social-linked" role="status">✓ Đã liên kết phương thức đăng nhập.</p>':''}${params.has('socialError')?`<p class="form-error" role="alert">${esc(socialError(params.get('socialError')))}</p>`:''}<div id="social-links"><p class="form-help" role="status">Đang tải phương thức đăng nhập…</p></div><p id="social-link-status" role="status"></p></section><section class="guide-box"><h3>Phiên đăng nhập</h3><p>Đăng xuất sau khi sử dụng máy dùng chung.</p><button class="btn" id="logout">${icon('log-out')} Đăng xuất</button></section></div></div>`;
 $('#profile-form').onsubmit=async event=>{
  event.preventDefault();const form=event.currentTarget,button=$('button[type=submit]',form),error=$('#profile-error');button.disabled=true;error.hidden=true;$('#profile-status').textContent='';
  try{const values=new FormData(form);currentUser=await apiCall('/api/account/profile',jsonOptions('PUT',{displayName:values.get('displayName'),level:values.get('level'),focusPuzzle:values.get('focusPuzzle'),dailyMinutes:Number(values.get('dailyMinutes'))}));roadmapData=null;renderIdentity();$('#profile-status').textContent='Đã lưu hồ sơ và cập nhật lộ trình.';hydrate();}
  catch(e){error.textContent=e.message;error.hidden=false;}finally{button.disabled=false;}
 };
 $('#logout').onclick=async()=>{const button=$('#logout');button.disabled=true;try{await personalWrite.catch(()=>{});await apiCall('/api/auth/logout',{method:'POST'});currentUser=null;progress={};history=[];csrfState=null;location.assign('/login');}catch(e){toast(e.message);button.disabled=false;}};
 if($('#claim-guest'))$('#claim-guest').onclick=async()=>{
  const button=$('#claim-guest');button.disabled=true;
  try{await importPersonal(guest);store.set('progress',{});$('#guest-import-status').textContent='Đã nhập và lưu tiến độ vào tài khoản.';button.remove();}
  catch(e){$('#guest-import-status').textContent=e.message;button.disabled=false;}
 };
 loadSocialLinks();
 hydrate();
}
async function importPersonal(incoming){
 const entries=Object.entries(incoming).filter(([id,s])=>data.some(c=>c.id===id)&&s&&typeof s==='object').map(([algorithmId,s])=>({algorithmId,learned:s.learned===true&&!!data.find(c=>c.id===algorithmId)?.algorithm,review:s.review===true&&s.learned!==true&&!!data.find(c=>c.id===algorithmId)?.algorithm,favorite:s.favorite===true}));
 await personalWrite.catch(()=>{});progress=progressMap(await apiCall('/api/progress/import',jsonOptions('POST',{entries})));roadmapData=null;
}
async function roadmapPage(){
 roadmapData=await apiCall('/api/roadmap');const plan=roadmapData;
 $('#main').innerHTML=crumb([['Lộ trình của tôi']])+title('Học đúng bước. Tiến bộ theo cách của bạn.',`${puzzleName(plan.user.focusPuzzle)} · ${levelLabels[plan.user.level]} · Mục tiêu ${plan.user.dailyMinutes} phút/ngày`)+`<section class="account-banner"><div><span class="badge">${plan.completed} / ${plan.total} CHẶNG HOÀN THÀNH</span><h2>${plan.percent}% hành trình hiện tại</h2><div class="progress-track" role="progressbar" aria-label="Tiến độ lộ trình" aria-valuenow="${plan.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${plan.percent}%"></span></div><p>${plan.learnedCases} case đã thuộc · ${plan.reviewCases} case cần luyện trên toàn thư viện.</p></div><a class="btn" href="/account">${icon('sliders-horizontal')} Đổi mục tiêu</a></section><div class="roadmap-list">${plan.stages.map((s,i)=>`<article class="roadmap-stage ${s.complete?'is-complete':''}" id="stage-${esc(s.id)}"><span class="stage-number">${s.complete?icon('check'):i+1}</span><div class="stage-body"><span class="badge">${s.complete?'✓ Hoàn thành':s.id===plan.nextStageId?'BƯỚC TIẾP THEO':'CHẶNG '+(i+1)}</span><h2>${esc(s.title)}</h2><p>${esc(s.description)}</p><div class="progress-track" role="progressbar" aria-label="${esc(s.title)}" aria-valuenow="${s.learned}" aria-valuemin="0" aria-valuemax="${s.total}"><span style="width:${s.total?s.learned*100/s.total:0}%"></span></div><small>${s.manual?(s.complete?'Đã thực hành':'Chưa đánh dấu hoàn thành'):`${s.learned} / ${s.total} case đã thuộc`}</small><div class="actions"><a class="btn" href="${esc(s.href)}" ${s.href.startsWith('https:')?'target="_blank" rel="noopener"':''}>${icon(s.manual?'book-open':'library')} ${s.manual?'Mở bài học':'Xem bộ công thức'}</a>${s.manual?`<button class="btn ${s.complete?'':'primary'}" data-stage="${esc(s.id)}" data-completed="${!s.complete}">${icon(s.complete?'rotate-ccw':'check')} ${s.complete?'Đánh dấu chưa hoàn thành':'Tôi đã thực hành'}</button>`:`<a class="btn primary" href="/practice?stage=${encodeURIComponent(s.id)}">${icon('play')} Luyện đúng chặng</a>`}</div></div></article>`).join('')}</div><p class="source-note">Bạn có thể xem mọi công thức. Chặng luyện được đề xuất theo hồ sơ; tiến độ công thức tự cập nhật khi đánh dấu đã thuộc. Các bài thực hành được bạn tự xác nhận.</p>`;
 $$('[data-stage]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await apiCall('/api/roadmap/stages/'+encodeURIComponent(button.dataset.stage),jsonOptions('PUT',{completed:button.dataset.completed==='true'}));await roadmapPage();}catch(e){toast(e.message);button.disabled=false;}});hydrate();
}
async function adminPage(page=0){
 const result=await apiCall('/api/admin/users?page='+page);
 $('#main').innerHTML=crumb([['Quản lý người học']])+title('Người học & tiến độ','Chỉ quản trị viên có quyền truy cập màn hình này.')+`<section class="guide-box"><h2>${result.total} tài khoản</h2><div class="table-scroll"><table class="guide-table"><thead><tr><th>Người học</th><th>Lộ trình</th><th>Case đã thuộc</th><th>Chi tiết</th></tr></thead><tbody>${result.items.map(({user:u,learned})=>`<tr><td><strong>${esc(u.displayName)}</strong><br>${esc(u.email)}<br><span class="badge">${esc(u.role)}</span></td><td>${esc(puzzleName(u.focusPuzzle))}<br>${esc(levelLabels[u.level])}</td><td>${learned}</td><td><button class="btn" data-user="${esc(u.id)}" aria-label="Xem tiến độ ${esc(u.displayName)}">Xem tiến độ</button></td></tr>`).join('')}</tbody></table></div><div class="actions"><button class="btn" id="admin-prev" ${page===0?'disabled':''}>Trước</button><span>Trang ${page+1} / ${Math.max(1,result.pages)}</span><button class="btn" id="admin-next" ${page+1>=result.pages?'disabled':''}>Sau</button></div></section><section class="guide-box" id="admin-detail" hidden aria-live="polite"></section>`;
 $('#admin-prev').onclick=()=>adminPage(page-1).catch(e=>toast(e.message));$('#admin-next').onclick=()=>adminPage(page+1).catch(e=>toast(e.message));
 $$('[data-user]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const detail=await apiCall('/api/admin/users/'+encodeURIComponent(button.dataset.user)),plan=detail.roadmap;const panel=$('#admin-detail');panel.hidden=false;panel.innerHTML=`<h2>${esc(plan.user.displayName)}</h2><p>${plan.completed}/${plan.total} chặng · ${plan.learnedCases} case đã thuộc · ${plan.reviewCases} cần luyện</p>${plan.stages.map(s=>`<p>${s.complete?'✓':'○'} ${esc(s.title)} — ${s.learned}/${s.total}</p>`).join('')}`;panel.scrollIntoView({block:'start',behavior:'auto'});}catch(e){toast(e.message);}finally{button.disabled=false;}});hydrate();
}

window.addEventListener("pageshow",event=>{if(event.persisted)location.reload();});

function socialError(code){
 return ({email_exists:'Email này đã có tài khoản. Hãy đăng nhập bằng email/mật khẩu hoặc phương thức đã liên kết, sau đó vào Tài khoản để liên kết Google/Facebook.',email_missing:'Dịch vụ chưa cung cấp email. Bạn có thể đăng ký bằng email rồi liên kết Facebook trong Tài khoản.',email_unverified:'Google chưa xác nhận email này. Hãy xác minh email với Google rồi thử lại.',identity_in_use:'Tài khoản Google/Facebook này đã liên kết với một người chơi khác. Tiến độ hai người không được gộp.',provider_already_linked:'Bạn đã liên kết một tài khoản khác của dịch vụ này.',link_expired:'Phiên liên kết đã hết hạn. Vui lòng đăng nhập lại và thử lại.',session_expired:'Phiên đăng nhập đã hết hạn. Vui lòng thử lại.',cancelled_or_failed:'Đăng nhập chưa hoàn tất hoặc bạn đã hủy. Hãy thử lại hoặc dùng email bên dưới.'})[code]||'Chưa thể hoàn tất đăng nhập. Vui lòng thử lại.';
}
function socialSignInButtons(register){
 const next=safeNext(register?'/account?welcome=1':'/roadmap');
 return `<div class="social-buttons">${socialProviders.map(p=>p.enabled?`<a class="social-btn ${esc(p.id)}" href="/oauth2/authorization/${esc(p.id)}?next=${encodeURIComponent(next)}"><span class="social-mark" aria-hidden="true">${p.id==='google'?'G':'f'}</span>Tiếp tục với ${esc(p.name)}</a>`:`<button class="social-btn" type="button" disabled aria-label="Đăng nhập ${esc(p.name)} chưa được bật"><span class="social-mark" aria-hidden="true">${p.id==='google'?'G':'f'}</span>${esc(p.name)}<small>Chưa bật</small></button>`).join('')}</div>${socialProviders.every(p=>!p.enabled)?'<p class="form-help">Google/Facebook hiện chưa được bật. Bạn vẫn có thể dùng email.</p>':''}<div class="auth-divider"><span>hoặc dùng email</span></div>`;
}
async function loadSocialLinks(){
 const slot=$('#social-links');if(!slot)return;
 try{
  const providers=await apiCall('/api/account/social');
  slot.innerHTML=providers.map(p=>`<div class="social-link-row"><span><strong>${esc(p.name)}</strong><small>${p.linked?'✓ Đã liên kết':p.enabled?'Chưa liên kết':'Hiện chưa bật'}</small></span><button class="btn" data-link-social="${esc(p.id)}" ${p.linked||!p.enabled?'disabled':''}>${p.linked?'Đã liên kết':'Liên kết '+esc(p.name)}</button></div>`).join('');
  $$('[data-link-social]',slot).forEach(button=>button.onclick=async()=>{
   button.disabled=true;
   try{await personalWrite.catch(()=>{});const result=await apiCall('/api/account/social/'+encodeURIComponent(button.dataset.linkSocial)+'/link',{method:'POST'});if(!result.redirect.startsWith('/oauth2/authorization/'))throw Error('Đường dẫn đăng nhập không hợp lệ.');location.assign(result.redirect);}
   catch(error){$('#social-link-status').textContent=error.message;button.disabled=false;}
  });
 }catch(error){slot.textContent=error.message;}
}
