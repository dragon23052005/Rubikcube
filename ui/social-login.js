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
