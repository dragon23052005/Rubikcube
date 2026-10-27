from pathlib import Path
from bs4 import BeautifulSoup
from urllib.request import urlopen
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
import hashlib,json
root=Path(__file__).resolve().parents[1];base='https://cubezone.be/'
s=BeautifulSoup((root/'sources/square1step1.html').read_bytes(),'html.parser')
out=root/'src/main/resources/static'
def fetch(im):
 url=urljoin(base,im['src']); key=hashlib.sha256(url.encode()).hexdigest()[:20]+'.gif';p=out/'images/source'/key
 if not p.exists():p.write_bytes(urlopen(url,timeout=30).read())
 return dict(name=im['alt'],image='/images/source/'+key,sourceUrl=base+'square1step1.html')
shapes=list(ThreadPoolExecutor(max_workers=2).map(fetch,s.select('table.noborder img[alt]')))
assert len(shapes)==29
(out/'shapes.json').write_text(json.dumps(shapes,ensure_ascii=False,indent=2),encoding='utf-8')
print('29 Cube Shape diagrams imported')
