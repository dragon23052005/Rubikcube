import unittest,json
from pathlib import Path
from collections import Counter
from pll_cube import solved,apply,orient,canonical,normalized,KEYS
root=Path(__file__).resolve().parents[1]
class PllMatchingTests(unittest.TestCase):
 def test_turn_inverses_and_color_conservation(self):
  initial=solved()
  for move in 'URFDLBMESurfdlbxyz':
   self.assertEqual(apply(f"{move} {move}'"),initial)
   self.assertEqual(apply(' '.join([move]*4)),initial)
   self.assertEqual(Counter(apply(move).values()),Counter(initial.values()))
 def test_wide_and_whole_cube_decompositions(self):
  for a,b in [('r',"R M'"),('l','L M'),('u',"U E'"),('d','D E'),('f','F S'),('b',"B S'"),('x',"R M' L'"),('y',"U E' D'"),('z',"F S B'")]:self.assertEqual(apply(a),apply(b))
 def test_all_reference_defaults_are_pll_states(self):
  refs=json.loads((root/'src/main/resources/static/pll-references.json').read_text())
  self.assertEqual(len(refs),21);self.assertEqual(len({r['caseName'] for r in refs}),21)
  for r in refs:
   state=orient(apply(r['algorithm']))
   for (p,n),color in state.items():
    if p[1]<1 or n==(0,1,0):self.assertEqual(color,solved()[(p,n)],r['caseName'])
 def test_pairing_is_bijective_and_primary_algorithms_are_preserved(self):
  data={c['id']:c for c in json.loads((root/'src/main/resources/static/data.json').read_text(encoding='utf-8'))}
  refs=json.loads((root/'src/main/resources/static/pll-references.json').read_text())
  self.assertEqual(sum(r['relation']=='SAME_SEQUENCE' for r in refs),4)
  for r in refs:
   c=data[r['id']];self.assertEqual(canonical(c['algorithm']),canonical(r['algorithm']))
   self.assertEqual(normalized(c['algorithm'])==normalized(r['algorithm']),r['relation']=='SAME_SEQUENCE')
   self.assertTrue((root/'src/main/resources/static'/r['imagePath'].lstrip('/')).read_bytes().startswith(b'\x89PNG'))
if __name__=='__main__':unittest.main()
