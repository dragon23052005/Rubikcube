from pathlib import Path
import json,re
from pll_cube import normalized
root=Path(__file__).resolve().parents[1];out=root/'src/main/resources/static';cases=[]
groups={'0 Corners':'0 góc định hướng','1 Corner':'1 góc định hướng','2 Corners':'2 góc định hướng','Solved D':'Tầng D đã đúng','Adjacent D':'Đổi góc kề nhau ở D','Diagonal D':'Đổi góc đối diện ở D'}
for kind,expected in [('oll',7),('pbl',5)]:
 source='https://www.jperm.net/algs/2x2'+kind
 raw=(root/f'sources/jperm-2x2{kind}.js').read_text()
 literal=raw.split('algsetAlgs=',1)[1].split(',algsetScrambles=',1)[0]
 literal=re.sub(r'([{,])(\w+):',r'\1"\2":',literal)
 data=json.loads(literal);assert len(data)==expected
 images={r['name']:r for r in json.loads((root/f'sources/jperm-2x2{kind}-images.json').read_text())}
 for n,row in enumerate(data,1):
  im=images[row['name']];visible=im['text'].split('Algorithm',1)[1].split('Best',1)[0]
  assert normalized(visible)==normalized(row['alg'][0])
  assert len(im['images'])==(2 if kind=='pbl' else 1)
  styles=[]
  for image in im['images']:
   assert (out/image['image'].lstrip('/')).read_bytes().startswith(b'\x89PNG')
   style=image['style']
   assert style in [None,'transform: scaleX(-1);']
   styles.append('scaleX(-1)' if style else '')
  slug=re.sub('[^a-z0-9]+','-',row['name'].lower())
  cases.append(dict(id=f'2x2-{kind}-{slug}',puzzle='2x2',method='2×2 '+kind.upper(),number=n,name=kind.upper()+' · '+row['name'],category=groups[row['group']],algorithm=row['alg'][0],alternatives=row['alg'][1:],images=[i['image'] for i in im['images']],imageTransforms=styles,recognition='',sourceUrl=source,verificationStatus='SOURCE_MATCHED',description='Công thức và ảnh từ J Perm, bộ Ortega 2×2. Ảnh ứng với công thức mặc định; giữ nguyên thứ tự và hướng hiển thị từ nguồn. Biến thể có thể cần đổi hướng cầm — đối chiếu nguồn trước khi thực hiện. Chưa xác minh trạng thái bằng solver độc lập.'))
(out/'jperm-2x2.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
print('Imported 12 2x2 cases: 7 OLL, 5 PBL; 17 images, 3 extra algorithms.')
