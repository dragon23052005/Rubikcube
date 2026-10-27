from pathlib import Path
import json,re
from pll_cube import canonical,normalized
root=Path(__file__).resolve().parents[1]
s=(root/'sources/jperm-pll.js').read_text()
literal=s.split('algsetAlgs=',1)[1].split(',algsetScrambles=',1)[0]
literal=literal.replace('pageDetails.arrows.scale','8').replace('pageDetails.arrows.color','"black"')
literal=re.sub(r'([{,])(\w+):',r'\1"\2":',literal)
jperm=json.loads(literal);assert len(jperm)==21
data=json.loads((root/'src/main/resources/static/data.json').read_text(encoding='utf-8'))
by_signature={canonical(c['alg'][0]):c for c in jperm};assert len(by_signature)==21
matches=[]
for c in data:
 if c['method']!='PLL':continue
 matched=by_signature.get(canonical(c['algorithm']))
 if not matched:raise ValueError('No state match for '+c['id'])
 relation='SAME_SEQUENCE' if normalized(c['algorithm'])==normalized(matched['alg'][0]) else 'ALTERNATIVE_SEQUENCE'
 matches.append(dict(id=c['id'],name=matched['name'],algorithm=matched['alg'][0],relation=relation,group=matched['group']))
assert len({m['name'] for m in matches})==21
(root/'sources/jperm-pll-data.json').write_text(json.dumps(jperm,indent=2),encoding='utf-8')
(root/'reports/jperm-pll-matches.json').write_text(json.dumps(matches,ensure_ascii=False,indent=2),encoding='utf-8')
for m in matches:print(m['id'],m['name'],m['relation'])
