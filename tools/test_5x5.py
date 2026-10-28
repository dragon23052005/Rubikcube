"""Source pairing, notation and a 150-sticker model for phase invariants."""
import unittest,json,re,struct,hashlib
from pathlib import Path
from pll_cube import FACES,rot
ROOT=Path(__file__).resolve().parents[1];STATIC=ROOT/'src/main/resources/static'
DATA=json.loads((STATIC/'cubeskills-5x5.json').read_text(encoding='utf-8'))

def solved():
 state={}
 for face,normal in FACES.items():
  axis=next(i for i,v in enumerate(normal) if v)
  for a in range(-2,3):
   for b in range(-2,3):
    p=[v*2 for v in normal];other=[i for i in range(3) if i!=axis];p[other[0]]=a;p[other[1]]=b
    state[(tuple(p),normal)]=face
 return state

def tokens(alg):
 clean=re.sub(r'[\s()\[\]]','',alg)
 parts=re.findall(r'(?:[23][RLUDFB]w?|[RLUDFB]w?|[MESxyz])2?\x27?',clean)
 if ''.join(parts)!=clean:raise ValueError(alg)
 return parts

def apply(alg,state=None):
 state=solved() if state is None else state
 for token in tokens(alg):
  match=re.fullmatch(r'([23]?)([RLUDFBMESxyz])(w?)(2?)(\x27?)',token)
  depth,face,wide,turn,prime=match.groups();q=int(turn or 1)*(-1 if prime else 1)
  if face in 'xyz':axis='xyz'.index(face);sign=-1;select=lambda p:True
  elif face in 'MES':axis={'M':0,'E':1,'S':2}[face];sign=-1 if face=='S' else 1;select=lambda p:p[axis]==0
  else:
   normal=FACES[face];axis=next(i for i,v in enumerate(normal) if v);side=normal[axis];sign=-side
   if wide:
    threshold=3-int(depth or 2);select=lambda p:p[axis]*side>=threshold
   elif depth:
    layer=3-int(depth);select=lambda p:p[axis]*side==layer
   else:select=lambda p:p[axis]*side==2
  state={(rot(p,axis,sign*q),rot(n,axis,sign*q)) if select(p) else (p,n):v for (p,n),v in state.items()}
 return state

def inverse(alg):
 return ' '.join(t[:-1] if t.endswith("'") else t+"'" for t in reversed(tokens(alg)))

def centers(state):
 return {(p,n):v for (p,n),v in state.items() if sum(abs(a)==2 for a in p)==1}

class FiveTests(unittest.TestCase):
 def test_source_pairing_images_and_namespaces(self):
  manifest=json.loads((ROOT/'sources/5x5-import-manifest.json').read_text(encoding='utf-8'))
  rows={r['id']:r for r in manifest if 'id' in r}
  self.assertEqual(31,len(DATA));self.assertEqual(31,len({c['id'] for c in DATA}))
  self.assertEqual(12,sum(c['method']=='5×5 L2E' for c in DATA));self.assertEqual(19,sum(c['method']=='5×5 L2C' for c in DATA))
  self.assertEqual(3,sum(len(c['alternatives']) for c in DATA))
  for c in DATA:
   self.assertEqual(rows[c['id']]['algorithm'],c['algorithm']);self.assertEqual(rows[c['id']]['alternatives'],c['alternatives'])
   image=(STATIC/c['images'][0].lstrip('/')).read_bytes()
   self.assertEqual(hashlib.sha256(image).hexdigest(),rows[c['id']]['sha256'])
   self.assertEqual(image[:8],b'\x89PNG\r\n\x1a\n');self.assertGreaterEqual(min(struct.unpack('>II',image[16:24])),150)
   self.assertEqual(c['puzzle'],'5x5')
 def test_notation_inverses_and_sticker_conservation(self):
  for c in DATA:
   for alg in [c['algorithm'],*c['alternatives']]:
    state=apply(alg);self.assertEqual(150,len(state));self.assertEqual(apply(inverse(alg),state),solved(),c['id'])
 def test_l2c_preserves_front_block_and_other_centers(self):
  for c in DATA:
   if c['method']!='5×5 L2C':continue
   state=apply(inverse(c['algorithm']))
   for (p,n),color in centers(state).items():
    face=next(f for f,v in FACES.items() if v==n)
    if face not in ['U','F'] or (face=='F' and p[0]<=0):self.assertEqual(color,face,c['id'])
 def test_l2e_preserves_uniform_centers_up_to_cube_rotation(self):
  invfaces={v:f for f,v in FACES.items()}
  for c in DATA:
   if c['method']!='5×5 L2E':continue
   for alg in [c['algorithm'],*c['alternatives']]:
    state=apply(alg)
    color_to_face={state[(tuple(v*2 for v in n),n)]:f for f,n in FACES.items()}
    for (p,n),color in centers(state).items():self.assertEqual(color_to_face[color],invfaces[n],c['id'])
 def test_l2e_inverse_leaves_at_most_two_unpaired_tredges(self):
  for c in DATA:
   if c['method']!='5×5 L2E':continue
   for alg in [c['algorithm'],*c['alternatives']]:
    state=apply(inverse(alg));slots={}
    for (p,n),color in state.items():
     if sum(abs(v)==2 for v in p)!=2:continue
     free=next(i for i,v in enumerate(p) if abs(v)!=2)
     slot=tuple(0 if i==free else v for i,v in enumerate(p))
     slots.setdefault(slot,{}).setdefault(p[free],{})[n]=color
    self.assertEqual(12,len(slots))
    unpaired=0
    for pieces in slots.values():
     pairs=[tuple(v for n,v in sorted(piece.items())) for piece in pieces.values()]
     if len(set(pairs))>1:unpaired+=1
    self.assertLessEqual(unpaired,2,c['id'])

if __name__=='__main__':unittest.main()
