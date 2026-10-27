function jpermImage(c, className = '') {
  const r=c.reference;
  return r?`<img class="${className}" src="${esc(r.imagePath)}" alt="${esc(r.caseName)} Perm — hình J Perm theo hướng cầm của công thức J Perm" loading="lazy" width="150" height="150">`:'';
}
function jpermCredit(c) {
  const r=c.reference;if(!r||r.relation!=='SAME_SEQUENCE')return '';
  return `<div class="reference-credit" id="jperm">${icon('image')} Hình minh họa từ <a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">J Perm · ${esc(r.caseName)}</a>. Công thức trùng sau khi chuẩn hóa ngoặc và lượt xoay liên tiếp.</div>`;
}
function referenceCard(c) {
  const r=c.reference;if(!r)return '';
  if(r.relation==='SAME_SEQUENCE')return `<a class="reference-card same" href="/algorithms/${c.id}#jperm">${icon('image')} Hình minh họa J Perm ${icon('arrow-up-right')}</a>`;
  return `<a class="reference-card" href="/algorithms/${c.id}#jperm">${jpermImage(c)}<span><strong>Cách 2 · J Perm</strong><small>${esc(r.caseName)} Perm · xem hướng cầm</small></span>${icon('chevron-right')}</a>`;
}
function alternativeBlock(c,alg,index) {
  const r=c.reference,jperm=r&&r.relation==='ALTERNATIVE_SEQUENCE'&&r.algorithm===alg;
  return `<section class="algorithm-block ${jperm?'jperm-alternative':''}" ${jperm?'id="jperm"':''}><label>${jperm?'CÁCH 2 · J PERM':'BIẾN THỂ '+(index+1)}</label>${jperm?`<div class="reference-recognition">${jpermImage(c)}<p>Đặt Rubik theo đúng hình J Perm trước khi thực hiện cách này. Hướng cầm có thể khác Cách 1.<br><a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">J Perm · ${esc(r.caseName)} ${icon('external-link')}</a></p></div>`:''}<code>${esc(alg)}</code><button class="btn ${jperm?'primary':''}" data-action="copy-alt" data-index="${index}" data-id="${c.id}">${icon('copy')} ${jperm?'Sao chép Cách 2':'Sao chép'}</button></section>`;
}
