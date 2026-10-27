"""Check shape-only kinematics; no claim about sticker permutation."""
import re,itertools
patterns=['CECEEEEEEE','CEEEEEEEEC','EEECEECEEE','EECEEEECEE','ECEEECEEEE']
algorithms=['/ (2,-2) / (-3,-4) / (4,-3) / (-5,-4) / (6,-3) /','/ (-2,-4) / (-1,-2) / (-3,-3) /','/ (-4,-2) / (-1,4) / (-3,0) /','/ (2,2) / (0,-1) / (3,3) /','/ (-4,0) / (5,4) / (2,-3) / (-5,-4) / (6,-3) /']
def expand(pattern,prefix):return [prefix+str(i) for i,c in enumerate(pattern) for _ in range(2 if c=='C' else 1)]
def rotate(r,n):n%=12;return r[n:]+r[:n]
def legal(r):return r[0]!=r[-1] and r[5]!=r[6]
def square(r):
 if r[0]==r[-1]:r=rotate(r,1)
 widths=[len(list(g)) for _,g in itertools.groupby(r)]
 return len(widths)==8 and all(widths[i]!=widths[(i+1)%8] for i in range(8))
def run(pattern,alg,st,sb,half,reverse):
 t,b=expand(pattern,'t'),expand('CCCCCC','b')
 for token in re.findall(r'/|\(-?\d+,-?\d+\)',alg):
  if token=='/':
   if not legal(t) or not legal(b):return False
   start=half*6;top=t[:6];bottom=b[start:start+6]
   t[:6]=bottom[::-1] if reverse else bottom;b[start:start+6]=top[::-1] if reverse else top
  else:
   a,c=map(int,token[1:-1].split(','));t=rotate(t,st*a);b=rotate(b,sb*c)
 return square(t) and square(b)
if __name__=='__main__':
 for convention in itertools.product([-1,1],[-1,1],[0,1],[False,True]):
  results=[run(p,a,*convention) for p,a in zip(patterns,algorithms)]
  if all(results):print('All five reach square layers:',convention)
