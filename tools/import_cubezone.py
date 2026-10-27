"""Reproducible source import. Never substitutes invented cases or images."""
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urljoin
import json,re,hashlib,time
BASE='https://cubezone.be/'
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'src/main/resources/static'
OUT.mkdir(parents=True,exist_ok=True)
assets=OUT/'images/source'; assets.mkdir(parents=True,exist_ok=True)
cases=[]; manifest={}; failures=[]
def soup(name): return BeautifulSoup((ROOT/'sources'/name).read_bytes(),'html.parser')
def image(src):
 url=urljoin(BASE,src); key=hashlib.sha256(url.encode()).hexdigest()[:20]+'.'+('png' if '.php' in url else url.split('.')[-1])
 path=assets/key
 try:
  if not path.exists():
   with urlopen(url,timeout=40) as r: data=r.read()
   if not data.startswith((b'GIF8',b'\x89PNG',b'\xff\xd8')): raise ValueError('not an image')
   path.write_bytes(data); time.sleep(.08)
  manifest[key]=url
  return '/images/source/'+key
 except Exception as e: failures.append({'url':url,'error':str(e)}); return ''
def add(method,group,name,algs,imgs,source,recognition=''):
 algs=[' '.join(a.split()) for a in algs if a.strip()]
 missing=not algs
 if missing:algs=['']
 n=1+sum(c['method']==method for c in cases)
 cases.append(dict(id=method.lower().replace(' ','-')+'-'+str(n),puzzle='sq1' if source.startswith('square') else '3x3',method=method,number=n,name=name or f'{method} · {n:02}',category=group,algorithm=algs[0],alternatives=algs[1:],images=[image(i) for i in imgs],recognition=recognition,sourceUrl=BASE+source,verificationStatus='SOURCE_EMPTY' if missing else 'SOURCE_MATCHED',description='Ô công thức trống tại nguồn; giữ hình và vị trí, không tự bổ sung công thức.' if missing else 'Đối chiếu công thức và hình nhận diện theo cùng ô/bảng tại CubeZone. Chưa xác minh bằng bộ giải độc lập.'))
def paired(source,method,group):
 s=soup(source)
 for table in s.select('table'):
  if table.find_parent('table'):continue
  rows=table.find_all('tr',recursive=False)
  for idx,row in enumerate(rows[:-1]):
   cells=row.find_all('td',recursive=False); nxt=rows[idx+1].find_all('td',recursive=False)
   if len(cells)!=len(nxt) or not cells:continue
   if not all(c.find('img') for c in cells):continue
   if any(c.find('img') or c.find('table') for c in nxt):continue
   for c,a in zip(cells,nxt):
    text=a.get_text(' ',strip=True)
    if not text and source=='conF2L1.html':
     add(method,group,'',[],[im['src'] for im in c.select('img')],source)
     continue
    if not re.search(r'[RUFLBDru]|\(-?\d+,',text):continue
    add(method,group,'',a.get_text('\n',strip=True).splitlines(),[im['src'] for im in c.select('img')],source)
for method,source in [('OLL','oll.html'),('PLL','pll.html')]:paired(source,method,'Định hướng tầng cuối' if method=='OLL' else 'Hoán vị tầng cuối')
s=soup('coll.html'); table=s.find('tr',class_='head').find_parent('table'); orientations=['','']
for row in table.find_all('tr',recursive=False)[1:]:
 cells=row.find_all('td',recursive=False); side=0; buffer=[]
 for c in cells:
  if c.has_attr('rowspan'):
   if c.img:orientations[side]=c.img['src']
   continue
  buffer.append(c)
  if len(buffer)==3:
   perm,colors,alg=buffer; rec=colors.get_text(' ',strip=True)
   add('COLL',Path(orientations[side]).stem,'',alg.get_text('\n',strip=True).splitlines(),[orientations[side],perm.img['src']],'coll.html',rec)
   buffer=[];side+=1
for path in sorted((ROOT/'sources').glob('*.html')):
 if path.name.startswith(('conU','sepU','insert','conF')):paired(path.name,'ZB F2L',path.stem)
for step,method in [(2,'CO'),(3,'EO'),(4,'CP'),(6,'Middle')]:paired(f'square1step{step}.html',method,'Square-1 · '+method)
s=soup('square1step5.html')
for row in s.select('tr'):
 cells=row.find_all('td',recursive=False)
 if len(cells)!=3 or not cells[0].find('img') or not cells[1].find('img'):continue
 lines=cells[2].get_text('\n',strip=True).splitlines()
 alg=[t for t in lines if re.search(r'\(-?\d+,',t)]
 if alg:add('EP',row.find_previous('h3').get_text(' ',strip=True),lines[0],alg,[c.img['src'] for c in cells[:2]],'square1step5.html')
# Step 6 contains three algorithms, with text descriptions instead of case images.
s=soup('square1step6.html')
for table in s.select('table'):
 rows=table.find_all('tr',recursive=False)
 if len(rows)==2 and len(rows[0].find_all('td',recursive=False))==3:
  for title,alg in zip(rows[0].find_all('td',recursive=False),rows[1].find_all('td',recursive=False)):
   if re.search(r'\(-?\d+,',alg.get_text()):add('Middle', 'Tầng giữa',title.get_text(' ',strip=True),[alg.get_text(' ',strip=True)],[],'square1step6.html')
(OUT/'data.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'sources/image-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(ROOT/'sources/import-errors.json').write_text(json.dumps(failures,indent=2),encoding='utf-8')
counts={m:sum(c['method']==m for c in cases) for m in dict.fromkeys(c['method'] for c in cases)}
print(json.dumps({'counts':counts,'total':len(cases),'imageErrors':failures},ensure_ascii=False,indent=2))
