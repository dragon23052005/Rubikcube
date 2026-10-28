async function timerPage(){
 const {TimerMachine,formatTime,resultMs,timerStats,inspectionPenalty}=await import('/timer-core.mjs');
 const owner=currentUser?.id||'guest',keyPrefix='sca-timer-'+owner+'-',settings=store.get('timer-settings',{puzzle:'3x3',inspection:true});
 let puzzle=['2x2','3x3','4x4','5x5','sq1'].includes(settings.puzzle)?settings.puzzle:'3x3',machine=new TimerMachine({inspection:settings.inspection!==false});
 let scramble=null,rows=[],total=0,pending=read('outbox',[]),loading=true,loadingHistory=true,writing=false,syncing=false,token=0,frame=0,spaceDown=false,pointerId=null,lastPhase='',lastRemoved=null,lastResult=null;
 const active=()=>['inspection','holding','ready','running'].includes(machine.phase);
 function read(key,fallback){try{return JSON.parse(localStorage.getItem(keyPrefix+key))??fallback;}catch{return fallback;}}
 function write(key,value){try{localStorage.setItem(keyPrefix+key,JSON.stringify(value));return true;}catch{toast('Bộ nhớ trình duyệt đầy. Hãy xuất kết quả; dữ liệu mới có thể chưa được giữ lại.');return false;}}
 $('#main').innerHTML=crumb([['Phòng bấm giờ']])+title('Mỗi lần giải. Một kỷ lục mới.','Scramble TNoodle · inspection 15 giây · thống kê theo từng loại Rubik.')+`
 <section class="timer-settings"><label>Loại Rubik<select id="timer-puzzle">${['2x2','3x3','4x4','5x5','sq1'].map(p=>`<option value="${p}" ${p===puzzle?'selected':''}>${esc(puzzleName(p))}</option>`).join('')}</select></label><label class="timer-check"><input type="checkbox" id="timer-inspection" ${machine.inspection?'checked':''}> Inspection 15 giây</label><span class="badge">Giữ 0,55 giây để sẵn sàng</span></section>
 <div class="timer-layout"><section class="timer-workspace"><article class="timer-scramble"><div class="section-heading"><h2>Scramble tiếp theo</h2><div class="actions"><button class="icon-btn" id="timer-copy" aria-label="Sao chép scramble" disabled>${icon('copy')}</button><button class="btn" id="timer-new" disabled>${icon('shuffle')} Scramble mới</button></div></div><p id="timer-scramble-source">TNoodle 0.20.0 · đang sinh scramble</p><div class="timer-scramble-text" id="timer-scramble-text" aria-live="polite"><span class="skeleton"></span></div><p class="form-error" id="timer-scramble-error" role="alert" hidden></p></article>
 <button type="button" class="timer-pad" id="timer-pad" disabled aria-label="Đang tải scramble"><span class="timer-phase" id="timer-phase">Đang chuẩn bị</span><span class="timer-digits" id="timer-digits" aria-hidden="true">0.00</span><span class="timer-instruction" id="timer-instruction">Scramble sắp sẵn sàng…</span></button><p id="timer-live" class="timer-vh" role="status" aria-live="polite"></p><div class="timer-help"><kbd>Space</kbd> bắt đầu/dừng · Giữ rồi thả để chạy · <kbd>Esc</kbd> kết thúc lượt đang chạy với DNF. Trên điện thoại, nhấn/giữ vùng đồng hồ.</div><p class="timer-result" id="timer-result" aria-live="polite"></p>
 <div class="timer-stats" id="timer-stats"></div><div class="timer-save-status" id="timer-save-status" role="status"></div><button class="btn" id="timer-sync" hidden>${icon('refresh-cw')} Thử lưu lại</button>
 </section><aside class="timer-aside"><section class="guide-box"><h2>Trạng thái sau scramble</h2><p>Cầm mặt trắng trên, xanh lá trước khi xáo. Thực hiện đầy đủ chuỗi theo thứ tự.</p><div id="timer-diagram" class="timer-diagram" aria-label="Hình trạng thái sau scramble"></div><small>Hình 2D từ TNoodle, không phải lời giải.</small></section><section class="guide-box"><h2>Nhịp thi đấu</h2><p>Inspection: bắt đầu trước 15 giây; từ 15 giây cộng 2 giây, từ 17 giây là DNF. Thời gian giữ để sẵn sàng vẫn tính vào inspection.</p><p>ao5 bỏ một lượt tốt nhất và một lượt tệ nhất. Hai DNF làm ao5 thành DNF. ao12 là chỉ số luyện tập, cũng bỏ một lượt ở mỗi đầu.</p><a class="text-link" href="https://www.worldcubeassociation.org/regulations/#article-A-speed-solving" target="_blank" rel="noopener">Quy định WCA ${icon('external-link')}</a><p class="timer-note">Đồng hồ bàn phím/chạm để luyện tập. Scramble dùng thư viện TNoodle; website không thay thế hệ thống thi đấu WCA hoặc timer phần cứng.</p></section></aside></div>
 <section class="guide-box timer-history"><div class="section-heading"><div><h2>Lịch sử lượt giải</h2><p id="timer-history-count"></p></div><button class="btn" id="timer-export">${icon('download')} Xuất CSV</button></div><p>${currentUser?'Kết quả lưu riêng theo tài khoản. Thống kê hiển thị trên tối đa 200 lượt gần nhất của loại Rubik đang chọn.':'Khách: giữ tối đa 200 lượt gần nhất cho mỗi loại Rubik trên trình duyệt này. <a href="/login?next=/timer">Đăng nhập để lưu theo tài khoản.</a>'}</p><p id="timer-history-error" class="form-error" role="alert" hidden></p><button class="btn" id="timer-history-retry" hidden>Thử tải lịch sử lại</button><div id="timer-undo" hidden></div><div id="timer-history"></div></section>`;
 const pad=$('#timer-pad'),digits=$('#timer-digits'),phase=$('#timer-phase'),instruction=$('#timer-instruction');
 function sorted(values){return values.sort((a,b)=>b.recordedAt-a.recordedAt||b.id.localeCompare(a.id)).slice(0,200);}
 function updateRow(row){rows=sorted([row,...rows.filter(r=>r.id!==row.id)].filter(r=>!r.deleted));if(lastResult?.id===row.id)lastResult=row;renderHistory();}
 function renderHistory(){
  const stats=timerStats(rows);$('#timer-stats').innerHTML=[['Tốt nhất',stats.best],['ao5 gần nhất',stats.ao5],['ao12 gần nhất',stats.ao12]].map(([label,value])=>`<article><span>${label}</span><strong>${formatTime(value)}</strong></article>`).join('');
  $('#timer-history-count').textContent=loadingHistory?'Đang tải lịch sử…':`${rows.length} lượt gần nhất${pending.filter(r=>r.puzzle===puzzle).length?' · còn lượt chờ đồng bộ':''}`;
  $('#timer-history').innerHTML=loadingHistory?'<p>Đang tải kết quả…</p>':!rows.length?'<div class="empty"><h3>Sẵn sàng cho lượt đầu tiên</h3><p>Xáo theo công thức phía trên rồi bắt đầu bấm giờ.</p></div>':`<div class="table-scroll"><table class="timer-table"><thead><tr><th>Lượt / thời điểm</th><th>Kết quả</th><th>Điều chỉnh</th><th>Scramble</th></tr></thead><tbody>${rows.map((r,i)=>{
   const auto=inspectionPenalty(r.inspectionMs),isPending=pending.some(p=>p.id===r.id),disabled=active()||writing||isPending;
   return `<tr><td>${rows.length-i}<small>${new Date(r.recordedAt).toLocaleString('vi-VN')}</small></td><td><strong>${formatTime(resultMs(r))}</strong><small>Gốc ${formatTime(r.elapsedMs)}${auto==='PLUS2'?' · inspection +2':auto==='DNF'?' · inspection DNF':''}${r.penalty==='PLUS2'?' · thêm +2':''}${isPending?' · chưa đồng bộ':''}</small></td><td><div class="timer-row-actions"><button class="btn" data-timer-penalty="PLUS2" data-id="${r.id}" aria-label="Cộng thêm 2 giây cho lượt ${rows.length-i}" aria-pressed="${r.penalty==='PLUS2'}" ${disabled?'disabled':''}>+2</button><button class="btn" data-timer-penalty="DNF" data-id="${r.id}" aria-label="Đánh dấu DNF cho lượt ${rows.length-i}" aria-pressed="${r.penalty==='DNF'}" ${disabled?'disabled':''}>DNF</button><button class="icon-btn" data-timer-remove="${r.id}" aria-label="Ẩn lượt ${rows.length-i}" ${disabled?'disabled':''}>${icon('trash-2')}</button></div></td><td><details><summary>Xem scramble</summary><code>${esc(r.scramble)}</code><small>${esc(r.generator)}</small></details></td></tr>`;
  }).join('')}</tbody></table></div>`;
  if(lastResult)$('#timer-result').textContent=`Vừa hoàn thành: ${formatTime(resultMs(lastResult))}${lastResult.inspectionMs!=null?' · inspection '+(lastResult.inspectionMs/1000).toFixed(2)+' giây':''}`;
  $('#timer-export').disabled=!rows.length||active();
  const restore=$('#timer-restore');if(restore)restore.disabled=active()||writing;
  hydrate();
 }
 function saveStatus(message){$('#timer-save-status').textContent=message;$('#timer-sync').hidden=!pending.length||owner==='guest';}
 async function sync(){
  if(owner==='guest'||syncing)return;syncing=true;saveStatus(pending.length?'Đang lưu kết quả…':'Kết quả đã đồng bộ.');
  try{for(const row of [...pending]){
   const value=await apiCall('/api/timer/solves',jsonOptions('POST',{id:row.id,scrambleId:row.scrambleId,elapsedMs:row.elapsedMs,inspectionMs:row.inspectionMs,penalty:row.penalty,recordedAt:row.recordedAt}));
   pending=pending.filter(p=>p.id!==row.id);write('outbox',pending);if(row.puzzle===puzzle)updateRow(value);
  }saveStatus('Kết quả đã lưu theo tài khoản.');}
  catch(e){saveStatus('Chưa đồng bộ được: '+e.message+' Lượt giải vẫn đang chờ trên thiết bị này.');}
  finally{syncing=false;$('#timer-sync').hidden=!pending.length;renderHistory();}
 }
 async function loadHistory(){
  loadingHistory=true;renderHistory();$('#timer-history-error').hidden=true;$('#timer-history-retry').hidden=true;const scope=puzzle;
  try{
   if(owner==='guest'){rows=read('history-'+scope,[]);total=rows.length;}
   else {const result=await apiCall('/api/timer/solves?puzzle='+scope);if(scope!==puzzle)return;rows=result.items;total=result.total;rows=sorted([...pending.filter(r=>r.puzzle===scope),...rows.filter(r=>!pending.some(p=>p.id===r.id))]);}
  }catch(e){if(scope===puzzle){rows=pending.filter(r=>r.puzzle===scope);$('#timer-history-error').textContent='Không tải được lịch sử: '+e.message;$('#timer-history-error').hidden=false;$('#timer-history-retry').hidden=false;}}
  finally{if(scope===puzzle){loadingHistory=false;if(!lastResult&&rows.length)lastResult=rows[0];renderHistory();draw();}}
 }
 async function newScramble(){
  if(active())return;const request=++token,scope=puzzle;loading=true;scramble=null;machine.reset();lastPhase='';draw();
  $('#timer-scramble-error').hidden=true;$('#timer-scramble-text').innerHTML='<span class="skeleton"></span>';$('#timer-diagram').innerHTML='';$('#timer-scramble-source').textContent='TNoodle 0.20.0 · đang sinh scramble';
  try{
   const value=await apiCall('/api/timer/scramble',jsonOptions('POST',{puzzle:scope}));if(request!==token)return;
   scramble=value;$('#timer-scramble-text').textContent=value.notation;$('#timer-scramble-source').textContent=value.generator+' · '+puzzleName(scope);$('#timer-diagram').innerHTML=value.svg;
  }catch(e){if(request!==token)return;$('#timer-scramble-text').textContent='Chưa có scramble.';$('#timer-scramble-error').textContent=e.message;$('#timer-scramble-error').hidden=false;}
  finally{if(request===token){loading=false;draw();}}
 }
 function phaseText(){
  if(loading||loadingHistory)return ['Đang chuẩn bị',loading?'Scramble sắp sẵn sàng…':'Đang tải lịch sử của bạn…'];
  if(!scramble)return ['Chưa có scramble','Nhấn Scramble mới để thử lại.'];
  switch(machine.phase){
   case 'inspection':return ['Inspection','Giữ Space hoặc vùng đồng hồ; khi xanh, thả để bắt đầu.'];
   case 'holding':return ['Giữ thêm một chút','Chờ đồng hồ chuyển xanh rồi thả.'];
   case 'ready':return ['Sẵn sàng','Thả để bắt đầu giải.'];
   case 'running':return ['Đang giải','Nhấn Space hoặc chạm đồng hồ để dừng.'];
   case 'stopped':return ['Đã hoàn thành','Đang chuẩn bị lượt tiếp theo…'];
   default:return ['Sẵn sàng luyện tập',machine.inspection?'Nhấn Space hoặc chạm để bắt đầu inspection.':'Giữ Space hoặc vùng đồng hồ đến khi xanh rồi thả.'];
  }
 }
 function draw(){
  const now=performance.now();machine.tick(now);const [name,help]=phaseText(),inInspection=machine.inspectionStart!=null&&['inspection','holding','ready'].includes(machine.phase);
  pad.dataset.phase=machine.phase;phase.textContent=name;instruction.textContent=help;
  if(inInspection){const elapsed=now-machine.inspectionStart;digits.textContent=elapsed>=15000?'+2':String(Math.max(0,Math.ceil((15000-elapsed)/1000)));pad.dataset.warning=elapsed>=15000?'penalty':elapsed>=12000?'urgent':elapsed>=8000?'notice':'';}
  else {digits.textContent=machine.phase==='stopped'?formatTime(resultMs(machine.result)):machine.phase==='idle'&&lastResult?formatTime(resultMs(lastResult)):formatTime(machine.elapsed(now));pad.dataset.warning='';}
  pad.disabled=loading||loadingHistory||writing||!scramble;$('#timer-new').disabled=active()||loading||writing;$('#timer-copy').disabled=!scramble||active();$('#timer-puzzle').disabled=active()||writing;$('#timer-inspection').disabled=active()||writing;
  const phaseKey=[machine.phase,loading,loadingHistory,!!scramble,machine.inspection].join(':');
  if(lastPhase!==phaseKey){lastPhase=phaseKey;pad.setAttribute('aria-label',name+'. '+help);$('#timer-live').textContent=name+'. '+help;renderHistory();}
  if(machine.result){finish(machine.result);return;}
  if(active()){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
 }
 function finish(result){
  const used=scramble;if(!used)return;scramble=null;pointerId=null;
  const row={id:crypto.randomUUID(),puzzle,scrambleId:used.id,scramble:used.notation,generator:used.generator,...result,deleted:false,recordedAt:Date.now(),version:0};lastResult=row;
  rows=sorted([row,...rows]);total++;
  if(owner==='guest'){write('history-'+puzzle,rows);total=rows.length;saveStatus('Đã lưu trên trình duyệt này.');}
  else {pending.push(row);write('outbox',pending);sync();}
  renderHistory();newScramble();
 }
 function down(){if(loading||loadingHistory||writing||!scramble)return;machine.press(performance.now());draw();}
 function up(){if(loading||!scramble)return;machine.release(performance.now());draw();}
 function keyDown(e){
  if(e.key==='Escape'&&machine.phase==='running'){e.preventDefault();machine.finish(performance.now(),true);draw();return;}
  if(e.code!=='Space')return;if(e.target.closest('input,select,textarea,a,button:not(#timer-pad)'))return;
  e.preventDefault();if(e.repeat||spaceDown)return;if(!active()&&!loading&&!loadingHistory)pad.scrollIntoView({block:'center',behavior:'instant'});spaceDown=true;down();
 }
 function keyUp(e){if(e.code==='Space'&&spaceDown){e.preventDefault();spaceDown=false;up();}}
 function blur(){spaceDown=false;pointerId=null;machine.cancelHold();draw();}
 document.addEventListener('keydown',keyDown);document.addEventListener('keyup',keyUp);window.addEventListener('blur',blur);
 pad.onpointerdown=e=>{if(e.button!==0||pointerId!=null)return;e.preventDefault();pad.focus({preventScroll:true});pointerId=e.pointerId;pad.setPointerCapture(pointerId);down();};
 pad.onpointerup=e=>{if(e.pointerId!==pointerId)return;pointerId=null;up();};pad.onpointercancel=()=>{pointerId=null;machine.cancelHold();draw();};
 pad.onclick=e=>{if(e.detail===0&&!spaceDown){down();up();}};
 $('#timer-puzzle').onchange=()=>{puzzle=$('#timer-puzzle').value;lastResult=null;lastRemoved=null;$('#timer-result').textContent='';$('#timer-undo').hidden=true;store.set('timer-settings',{puzzle,inspection:machine.inspection});loadHistory();newScramble();};
 $('#timer-inspection').onchange=()=>{machine.inspection=$('#timer-inspection').checked;store.set('timer-settings',{puzzle,inspection:machine.inspection});draw();};
 $('#timer-new').onclick=newScramble;$('#timer-sync').onclick=sync;$('#timer-history-retry').onclick=loadHistory;
 $('#timer-copy').onclick=async()=>{try{await navigator.clipboard.writeText(scramble.notation);toast('Đã sao chép scramble');}catch{toast('Không sao chép được. Hãy chọn chuỗi scramble để sao chép.');}};
 async function change(row,penalty,deleted){
  if(active()||writing)return;writing=true;renderHistory();draw();
  try{
   const value=owner==='guest'?{...row,penalty,deleted,version:row.version+1}:await apiCall('/api/timer/solves/'+row.id,jsonOptions('PUT',{penalty,deleted,version:row.version}));
   updateRow(value);if(deleted)total--;else if(row.deleted)total++;
   if(owner==='guest')write('history-'+puzzle,rows);
   if(deleted){lastRemoved=value;$('#timer-undo').innerHTML='Đã ẩn lượt. <button class="btn" id="timer-restore">Hoàn tác</button>';$('#timer-undo').hidden=false;$('#timer-restore').onclick=()=>{if(lastRemoved)change(lastRemoved,lastRemoved.penalty,false);};}
   else if(row.deleted){lastRemoved=null;$('#timer-undo').hidden=true;}
  }catch(e){toast(e.message);}
  finally{writing=false;renderHistory();draw();}
 }
 $('#timer-history').onclick=e=>{const b=e.target.closest('[data-timer-penalty],[data-timer-remove]');if(!b)return;const row=rows.find(r=>r.id===(b.dataset.id||b.dataset.timerRemove));if(!row)return;if(b.dataset.timerRemove)change(row,row.penalty,true);else change(row,row.penalty===b.dataset.timerPenalty?'NONE':b.dataset.timerPenalty,false);};
 $('#timer-export').onclick=()=>{
  const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"',csv=[['Thoi diem','Rubik','Goc (ms)','Inspection (ms)','Phat them','Ket qua','Scramble','Nguon'],...rows.map(r=>[new Date(r.recordedAt).toISOString(),r.puzzle,r.elapsedMs,r.inspectionMs,r.penalty,formatTime(resultMs(r)),r.scramble,r.generator])].map(r=>r.map(cell).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='speedcube-'+puzzle+'-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 window.addEventListener('pagehide',()=>{token++;cancelAnimationFrame(frame);document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);},{once:true});
 hydrate();draw();await Promise.all([loadHistory(),newScramble()]);if(pending.length)sync();
}
