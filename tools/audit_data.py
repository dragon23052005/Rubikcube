from pathlib import Path
from bs4 import BeautifulSoup
from collections import Counter,defaultdict
import json,re,hashlib
root=Path(__file__).resolve().parents[1];static=root/'src/main/resources/static'
data=json.loads((static/'data.json').read_text(encoding='utf-8'));manifest=json.loads((root/'sources/image-manifest.json').read_text())
normalize=lambda s:re.sub(r'\s+','',s)
errors=[];duplicates=defaultdict(list)
for c in data:
 source=root/'sources'/c['sourceUrl'].rsplit('/',1)[1]
 text=normalize(BeautifulSoup(source.read_bytes(),'html.parser').get_text(' ',strip=True))
 for alg in [c['algorithm']]+c['alternatives']:
  if alg and normalize(alg) not in text:errors.append({'id':c['id'],'reason':'algorithm not present in source'})
 for image in c['images']:
  if not (static/image.lstrip('/')).exists():errors.append({'id':c['id'],'reason':'missing image'})
 if c['algorithm']:duplicates[(c['method'],normalize(c['algorithm']))].append(c['id'])
report=dict(cases=len(data),casesWithAlgorithm=sum(bool(c['algorithm']) for c in data),sourceMatched=sum(c['verificationStatus']=='SOURCE_MATCHED' for c in data),independentlySolverVerified=0,counts=dict(Counter(c['method'] for c in data)),alternativeAlgorithms=sum(len(c['alternatives']) for c in data),imageReferences=sum(len(c['images']) for c in data),uniqueCaseImages=len({i for c in data for i in c['images']}),sourceEmpty=[c['id'] for c in data if not c['algorithm']],duplicates=[ids for ids in duplicates.values() if len(ids)>1],errors=errors,sha256={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (root/'sources').glob('*.html')})
(root/'reports').mkdir(exist_ok=True)
(root/'reports/data-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['sha256','duplicates']},ensure_ascii=False,indent=2))
assert not errors
assert len(data)==501 and report['counts']['ZB F2L']==306
