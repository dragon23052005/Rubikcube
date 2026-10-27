from pathlib import Path
p=Path('src/main/resources/static/app.js');s=p.read_text(encoding='utf-8')
s=s.replace('let imgs = c.images.filter(Boolean);','let imgs = c.reference?.relation === "SAME_SEQUENCE" ? [c.reference.imagePath] : c.images.filter(Boolean);')
s=s.replace('</div><div class="card-actions"><button data-action="copy"','${referenceCard(c)}</div><div class="card-actions"><button data-action="copy"')
old='${c.alternatives.map((alg, i) => `<div class="algorithm-block"><label>BIẾN THỂ ${i + 1}</label><code>${esc(alg)}</code><button class="btn" data-action="copy-alt" data-index="${i}" data-id="${id}">${icon("copy")} Sao chép</button></div>`).join("")}'
assert old in s
s=s.replace(old,'${jpermCredit(c)}${c.alternatives.map((alg, i) => alternativeBlock(c,alg,i)).join("")}')
s=s.replace('<label>CÔNG THỨC CHÍNH</label>','<label>${c.reference ? "CÁCH 1 · CUBEZONE" : "CÔNG THỨC CHÍNH"}</label>')
s=s.replace(': "Hình nhận diện theo hướng quan sát của nguồn"', ': (c.reference?.relation === "SAME_SEQUENCE" ? "Hình J Perm · cùng chuỗi công thức" : "Hình CubeZone · hướng cầm cho Cách 1")')
s=s.replace('data-source="jperm"','data-source="jperm"')
s=s.replace('${esc(c.algorithm)}</code><div class="actions">','${esc(c.algorithm)}</code>${c.reference?.relation === "ALTERNATIVE_SEQUENCE" ? `<a class="text-link" href="/algorithms/${c.id}#jperm">Xem Cách 2 · J Perm và hướng cầm</a>` : ""}<div class="actions">')
s=s.replace('Dữ liệu CubeZone & case từ ảnh tham chiếu.', 'Dữ liệu CubeZone, J Perm & case từ ảnh tham chiếu.')
s+='\n'+Path('ui/jperm-reference.js').read_text(encoding='utf-8')
p.write_text(s,encoding='utf-8')
p=Path('src/main/resources/static/app.css');p.write_text(p.read_text(encoding='utf-8')+'\n'+Path('ui/jperm-reference.css').read_text(encoding='utf-8'),encoding='utf-8')
