"""Integer-coordinate 3x3 sticker model for comparing source PLL effects."""
import re
from collections import deque
FACES={'R':(1,0,0),'L':(-1,0,0),'U':(0,1,0),'D':(0,-1,0),'F':(0,0,1),'B':(0,0,-1)}
def solved():
 out={}
 for face,n in FACES.items():
  axis=next(i for i,v in enumerate(n) if v)
  for a in [-1,0,1]:
   for b in [-1,0,1]:
    p=list(n);other=[i for i in range(3) if i!=axis];p[other[0]]=a;p[other[1]]=b
    out[(tuple(p),n)]=face
 return out
def rot(v,axis,q):
 x,y,z=v
 for _ in range(q%4):
  if axis==0:y,z=-z,y
  elif axis==1:x,z=z,-x
  else:x,y=-y,x
 return (x,y,z)
def move(state,token):
 face=token[0];suffix=token[1:];turns=int(suffix[0]) if suffix and suffix[0].isdigit() else 1
 if "'" in suffix:turns=-turns
 if face in 'xyz':axis='xyz'.index(face);sign=-1;select=lambda p:True
 elif face in 'MES':axis={'M':0,'E':1,'S':2}[face];sign=-1 if face=='S' else 1;select=lambda p:p[axis]==0
 else:
  n=FACES[face.upper()];axis=next(i for i,v in enumerate(n) if v);side=n[axis];sign=-side
  select=(lambda p:p[axis]*side>=0) if face.islower() else (lambda p:p[axis]==side)
 return {(rot(p,axis,sign*turns),rot(n,axis,sign*turns)) if select(p) else (p,n):color for (p,n),color in state.items()}
def tokens(alg):
 clean=re.sub(r'[()\s]','',alg);parts=re.findall(r'[URFDLBMESurfdlbxyz][23]?\x27?',clean)
 if ''.join(parts)!=clean:raise ValueError('Unsupported notation: '+alg)
 return parts
def apply(alg,state=None):
 state=solved() if state is None else state
 for t in tokens(alg):state=move(state,t)
 return state
KEYS=sorted(solved())
def signature(state):
 # Relabel center colors: whole-cube rotations do not change a PLL case.
 center={color:FACES_INV[n] for (p,n),color in state.items() if p==n}
 return tuple(center[state[k]] for k in KEYS)
FACES_INV={v:k for k,v in FACES.items()}
def centers(state):return tuple(state[(n,n)] for n in FACES.values())
def orientations():
 seen={};queue=deque([(solved(),[])])
 while queue:
  state,path=queue.popleft();key=centers(state)
  if key in seen:continue
  seen[key]=[t+"'" for t in reversed(path)]
  for axis in 'xyz':queue.append((move(state,axis),path+[axis]))
 assert len(seen)==24
 return seen
ORIENTATIONS=orientations()
def orient(state):
 for token in ORIENTATIONS[centers(state)]:state=move(state,token)
 return state
def canonical(alg):
 sigs=[]
 for y in range(4):
  for pre in range(4):
   # Conjugate by whole-cube yaw, with independent U adjustment at both ends.
   s=apply('y '*y,orient(apply('U '*pre+alg)))
   for post in range(4):sigs.append(signature(apply('U '*post,s)))
 return min(sigs)
def normalized(alg):
 out=[]
 for token in tokens(alg):
  f=token[0];s=token[1:];q=int(s[0]) if s and s[0].isdigit() else 1
  if "'" in s:q=-q
  if out and out[-1][0]==f:q+=out.pop()[1]
  if q%4:out.append((f,q%4))
 return tuple(out)
