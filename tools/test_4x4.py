import json,re,unittest,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
STATIC=ROOT/'src/main/resources/static'

class FourByFourTests(unittest.TestCase):
 def test_namespaces_and_source_sets(self):
  cases=json.loads((STATIC/'jperm-4x4.json').read_text(encoding='utf-8'))
  self.assertEqual(57,len({c['id'] for c in cases}))
  for kind in ['oll','pll']:
   source=json.loads((ROOT/f'sources/jperm-4x4{kind}.data.json').read_text())
   actual=[c for c in cases if c['method']=='4×4 '+kind.upper()]
   self.assertEqual(len(source),len(actual))
   for s,c in zip(source,actual):
    self.assertEqual(c['name'],'%s parity · %s'%(kind.upper(),s['name']))
    self.assertEqual(len(c['alternatives']),len(s['alg'])-1)
  self.assertEqual(13,sum(len(c['alternatives']) for c in cases))
 def test_copyable_notation_and_pngs(self):
  cases=json.loads((STATIC/'jperm-4x4.json').read_text(encoding='utf-8'))
  for c in cases:
   for alg in [c['algorithm'],*c['alternatives']]:
    clean=re.sub(r'[\s()]','',alg)
    tokens=re.findall(r'(?:[23][RLUDFB]w?|[RLUDFB]w?|[MESxyz])[23]?\x27?',clean)
    self.assertEqual(clean,''.join(tokens),c['id'])
   for img in c['images']:
    data=(STATIC/img.lstrip('/')).read_bytes()
    self.assertEqual(data[:8],b'\x89PNG\r\n\x1a\n')
    width,height=struct.unpack('>II',data[16:24]);self.assertGreaterEqual(width,150);self.assertGreaterEqual(height,150)

if __name__=='__main__':unittest.main()
