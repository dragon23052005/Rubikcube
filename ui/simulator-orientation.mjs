import { puzzles } from 'cubing/puzzles';
let rotationsPromise;
async function rotations(){
 return rotationsPromise??=(async()=>{
  const cube=await puzzles['3x3x3'].kpuzzle(),queue=[''],seen=new Set(),result=[];
  for(let i=0;i<queue.length;i++){
   const alg=queue[i],key=cube.defaultPattern().applyAlg(alg).patternData.CENTERS.pieces.join(',');
   if(seen.has(key))continue;seen.add(key);result.push(alg);
   for(const move of ['x','y','z'])queue.push((alg+' '+move).trim());
  }
  return result;
 })();
}
// With an end anchor, using a solved endpoint in a fixed orientation can put
// blue/green centers on top after the inverse of x, l, r or M moves. Choose the
// SOLVED ENDPOINT orientation so that the initial grip has canonical centers.
// The algorithm itself and the renderer's axes are never rotated or rewritten.
export async function initialGripSetup(kpuzzle,alg,puzzle){
 const model=puzzle==='2x2'?await puzzles['3x3x3'].kpuzzle():kpuzzle;
 const solved=model.defaultPattern(),inverse=model.algToTransformation(alg.invert());
 const orbits=model.definition.orbits.filter(o=>o.orbitName.startsWith('CENTER'));
 const maximum=orbits.reduce((sum,o)=>sum+o.numPieces*(o.numPieces===6?100:1),0);
 let best='',bestScore=-1;
 for(const rotation of await rotations()){
  const initial=solved.applyAlg(rotation).applyTransformation(inverse);
  const score=orbits.reduce((sum,o)=>sum+initial.patternData[o.orbitName].pieces.reduce((n,p,i)=>n+(p===solved.patternData[o.orbitName].pieces[i]?(o.numPieces===6?100:1):0),0),0);
  if(score>bestScore){best=rotation;bestScore=score;}
  if(score===maximum)break;
 }
 return best;
}
