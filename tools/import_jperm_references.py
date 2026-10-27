"""Preserve CubeZone PLL and add matched, source-paired J Perm references."""
from pathlib import Path
import json,hashlib
from pll_cube import canonical,normalized
root=Path(__file__).resolve().parents[1];static=root/'src/main/resources/static'
matches=json.loads((root/'reports/jperm-pll-matches.json').read_text(encoding='utf-8'))
images={i['name']:i for i in json.loads((root/'sources/jperm-pll-images.json').read_text())}
cases={c['id']:c for c in json.loads((static/'data.json').read_text(encoding='utf-8'))}
refs=[]
for m in matches:
 im=images[m['name']];path=static/im['image'].lstrip('/')
 assert path.read_bytes().startswith(b'\x89PNG') and not im['style']
 visible=im['visibleText'].split('Algorithm',1)[1].split('Best',1)[0]
 assert normalized(visible)==normalized(m['algorithm']),f'Image algorithm mismatch: {m["name"]}'
 assert canonical(cases[m['id']]['algorithm'])==canonical(m['algorithm'])
 refs.append(dict(id=m['id'],provider='J Perm',caseName=m['name'],algorithm=m['algorithm'],imagePath=im['image'],sourceUrl=im['sourceUrl'],relation=m['relation'],category=m['group']))
assert len(refs)==21
(static/'pll-references.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
print('J Perm: 21 paired images; 4 matching sequences, 17 alternative sequences.')
