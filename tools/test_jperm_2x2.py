import unittest,json,struct,re
from pathlib import Path
from pll_cube import solved,apply,tokens,normalized
root=Path(__file__).resolve().parents[1];static=root/'src/main/resources/static'
data=json.loads((static/'jperm-2x2.json').read_text(encoding='utf-8'))
class TwoByTwoTests(unittest.TestCase):
 def test_counts_and_separate_namespaces(self):
  self.assertEqual(len(data),12);self.assertEqual(len({c['id'] for c in data}),12)
  self.assertEqual(sum(c['method']=='2×2 OLL' for c in data),7);self.assertEqual(sum(c['method']=='2×2 PBL' for c in data),5)
  self.assertTrue(all(c['puzzle']=='2x2' for c in data))
 def test_images_and_pbl_mirror_match_source(self):
  for c in data:
   self.assertEqual(len(c['images']),2 if c['method']=='2×2 PBL' else 1)
   for im in c['images']:
    content=(static/im.lstrip('/')).read_bytes();self.assertTrue(content.startswith(b'\x89PNG'));self.assertEqual(struct.unpack('>II',content[16:24]),(150,150))
   if c['method']=='2×2 PBL':self.assertEqual(c['imageTransforms'],['','scaleX(-1)'])
 def test_default_algorithm_matches_rendered_source_row(self):
  for kind in ['oll','pbl']:
   rows=json.loads((root/f'sources/jperm-2x2{kind}-images.json').read_text())
   for row in rows:
    c=next(c for c in data if c['name']==kind.upper()+' · '+row['name'])
    self.assertEqual(normalized(c['algorithm']),normalized(row['text'].split('Algorithm',1)[1].split('Best',1)[0]))
 def test_algorithms_preserve_ortega_phase_on_corner_model(self):
  corners={k:v for k,v in solved().items() if all(abs(x)==1 for x in k[0])}
  for c in data:
   for alg in [c['algorithm']]+c['alternatives']:
    self.assertTrue(all(t[0] in 'URFDLB' for t in tokens(alg)))
    result=apply(alg,corners);self.assertEqual(len(result),24)
    self.assertEqual(len({v for (p,n),v in result.items() if n==(0,-1,0)}),1)
    if c['method']=='2×2 PBL':self.assertEqual(len({v for (p,n),v in result.items() if n==(0,1,0)}),1)
if __name__=='__main__':unittest.main()
