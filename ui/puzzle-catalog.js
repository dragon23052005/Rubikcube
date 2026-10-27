let puzzleTypes=[];
function puzzleName(id){return puzzleTypes.find(p=>p.id===id)?.name||id;}
function puzzleCodes(){return puzzleTypes.map(p=>p.id).sort((a,b)=>['3x3','2x2','sq1'].indexOf(a)-['3x3','2x2','sq1'].indexOf(b));}
function cube2Art(){
 const faces=[[[50,8],[102,34],[50,60],[-2,34]], [[-2,36],[50,62],[50,118],[-2,92]], [[52,62],[104,36],[104,92],[52,118]]];
 let cells='';faces.forEach((f,k)=>{const point=(u,v)=>[(1-u)*(1-v)*f[0][0]+u*(1-v)*f[1][0]+u*v*f[2][0]+(1-u)*v*f[3][0],(1-u)*(1-v)*f[0][1]+u*(1-v)*f[1][1]+u*v*f[2][1]+(1-u)*v*f[3][1]];for(let r=0;r<2;r++)for(let c=0;c<2;c++)cells+=`<polygon points="${[[c/2,r/2],[(c+1)/2,r/2],[(c+1)/2,(r+1)/2],[c/2,(r+1)/2]].map(([u,v])=>point(u,v).join(',')).join(' ')}" fill="${['#d1caff','#9185de','#e6e0ff'][k]}" stroke="#655d9a" stroke-width="2.3"/>`;});
 return `<svg viewBox="-8 0 120 126" aria-hidden="true">${cells}</svg>`;
}
function puzzleCard(p){
 const ms=methods(p),total=data.filter(c=>c.puzzle===p).length;
 const subtitle=p==='sq1'?'Hình dạng mới. Thử thách mới.':p==='2x2'?'Ortega · Từ từng mặt đến cả khối.':'Từ những bước đầu đến sub-20.';
 return `<article class="puzzle-card"><div class="puzzle-card-top"><a href="/methods?puzzle=${p}" class="puzzle-icon" aria-label="Khám phá ${esc(puzzleName(p))}">${p==='2x2'?cube2Art():cubeArt(p==='sq1')}</a><div class="puzzle-title"><h3><a href="/methods?puzzle=${p}">${esc(puzzleName(p))}</a></h3><p>${subtitle}</p></div><span class="badge ${p==='sq1'?'green':''}">${p==='2x2'?'Ortega':p==='sq1'?'Thử thách':'Phổ biến'}</span></div><div class="method-chips">${ms.map(m=>`<a class="method-chip" href="/algorithms?method=${encodeURIComponent(m)}">${esc(m.replace('2×2 ',''))}<b>${count(m)}</b></a>`).join('')}${p==='sq1'?'<a class="method-chip" href="/guide#square1">29 hình cơ bản <b>Hướng dẫn</b></a>':''}</div><div class="puzzle-card-footer"><span>${ms.length} bộ công thức · ${total} case</span><a href="/methods?puzzle=${p}">Khám phá ${icon('arrow-right')}</a></div></article>`;
}
