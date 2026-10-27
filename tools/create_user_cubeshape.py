"""Create precise vector diagrams from piece widths, using user references."""
from pathlib import Path
import math,json,shutil,tempfile
from check_user_cubeshape import patterns,algorithms,run
root=Path(__file__).resolve().parents[1];out=root/'src/main/resources/static';images=out/'images/cubeshape';images.mkdir(parents=True,exist_ok=True)
refs=out/'references';refs.mkdir(exist_ok=True)
attachments=['19a36c3a-e747-48a1-bd6d-d6acfe01ba81','7453bbb3-6797-4b5c-b4ad-531386a260f3','acce6eff-a4a9-427a-b4b3-c3bd89d81b46','f4fe17ad-cdcd-4784-9403-601f83b51255','195186b6-e3b4-4378-93d1-651efa629bcf']
names=['7–1','8','6–2','4–4','5–3']
def svg(pattern,title):
 angle=-90;paths=[]
 def point(deg,r=72):
  a=math.radians(deg);return f'{120+r*math.cos(a):.4f},{120+r*math.sin(a):.4f}'
 for piece in pattern:
  width=60 if piece=='C' else 30
  vertices=['120,120',point(angle)]
  if piece=='C':vertices.append(point(angle+30,72*(math.sqrt(3)+1)/2))
  vertices.append(point(angle+width))
  paths.append(f'<polygon points="{" ".join(vertices)}" fill="{"#c7d2fe" if piece=="C" else "#e0e7ff"}"/>')
  angle+=width
 assert angle==270
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-labelledby="title"><title id="title">{title}</title><g stroke="#334155" stroke-width="2.6" stroke-linejoin="round">{"".join(paths)}</g></svg>'
(images/'star.svg').write_text(svg('CCCCCC','Star — 6 góc'),encoding='utf-8')
cases=[]
for i,(pattern,alg,name,attachment) in enumerate(zip(patterns,algorithms,names,attachments),1):
 assert len(pattern)==10 and pattern.count('C')==2 and pattern.count('E')==8
 assert run(pattern,alg,-1,1,1,True),f'Case {i} does not reach square layers'
 (images/f'cs-{i}.svg').write_text(svg(pattern,f'Cube Shape {name} — 2 góc, 8 cạnh'),encoding='utf-8')
 source=f'/references/square1-cs-{i}.png'
 target=out/source.lstrip('/')
 if not target.exists():shutil.copyfile(Path(tempfile.gettempdir())/f'codex-clipboard-{attachment}.png',target)
 cases.append(dict(id=f'cs-{i}',puzzle='sq1',method='CS',number=i,name=f'{name} / Star',category='2 góc + 8 cạnh / 6 góc',algorithm=alg,alternatives=[],images=[f'/images/cubeshape/cs-{i}.svg','/images/cubeshape/star.svg'],recognition='',sourceUrl=source,verificationStatus='USER_REFERENCE_SHAPE_CHECKED',description='Công thức chép từ ảnh bạn cung cấp. Hình SVG dựng theo góc 30°/60° của mảnh cạnh/góc. Đã kiểm tra lát cắt hợp lệ và hai tầng về dạng vuông; chưa kiểm chứng màu hoặc hoán vị. Giữ hình theo đúng hướng như ảnh; thực hiện cả dấu / đầu và cuối.'))
(out/'user-cases.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'reports/cubeshape-user-cases.json').write_text(json.dumps(dict(count=5,duplicateReferences=[3,4],cases=[dict(id=c['id'],pattern=p,algorithm=c['algorithm'],shapeChecked=True) for c,p in zip(cases,patterns)],scope='Shape only; not sticker orientation or permutation'),ensure_ascii=False,indent=2),encoding='utf-8')
print('Created 5 Cube Shape cases, 6 SVG diagrams; all shape checks passed.')
