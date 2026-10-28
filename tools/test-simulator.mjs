import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Alg} from 'cubing/alg';
import {puzzles} from 'cubing/puzzles';
import {normalizeCubeAlg,parseSquare1,squareTimeline,squareSolved,squareMove} from '../ui/simulator-notation.mjs';
import {initialGripSetup} from '../ui/simulator-orientation.mjs';
const read=name=>JSON.parse(readFileSync(`src/main/resources/static/${name}.json`,'utf8'));
const rows=['data','user-cases','jperm-2x2','jperm-4x4','cubeskills-5x5'].flatMap(read);
for(const ref of read('pll-references'))if(ref.relation==='ALTERNATIVE_SEQUENCE'){
 const row=rows.find(c=>c.id===ref.id);if(!row.alternatives.includes(ref.algorithm))row.alternatives.push(ref.algorithm);
}
const formulas=rows.flatMap(c=>[c.algorithm,...c.alternatives].filter(Boolean).map(alg=>({c,alg})));
const ids={'2x2':'2x2x2','3x3':'3x3x3','4x4':'4x4x4','5x5':'5x5x5'};
test('all current catalog formulas and variants have valid puzzle moves and invert exactly',async()=>{
 assert.equal(rows.length,606);assert.equal(formulas.length,666);
 for(const {c,alg:text} of formulas){
  if(c.puzzle==='sq1'){squareTimeline(parseSquare1(text));continue;}
  const k=await puzzles[ids[c.puzzle]].kpuzzle(),alg=new Alg(normalizeCubeAlg(text,c.puzzle));
  assert.ok(k.algToTransformation(alg).applyTransformation(k.algToTransformation(alg.invert())).isIdentityTransformation(),c.id);
 }
});
test('4x4 M means two inner layers; 5x5 M means the central layer',async()=>{
 const four=await puzzles['4x4x4'].kpuzzle(),five=await puzzles['5x5x5'].kpuzzle();
 for(const suffix of ['',"'",'2']){
  const a=four.algToTransformation(normalizeCubeAlg('M'+suffix,'4x4'));
  assert.ok(a.isIdentical(four.algToTransformation(new Alg("3Lw L'").experimentalSimplify({cancel:true}).toString()).selfMultiply(suffix==='2'?2:suffix==="'"?-1:1)));
 }
 assert.ok(five.algToTransformation('M').isIdentical(five.algToTransformation('3L')));
});
test('initial grip keeps canonical centers for every 3x3 and odd-cube formula, including wide turns and rotations',async()=>{
 for(const {c,alg:text} of formulas.filter(x=>['2x2','3x3','5x5'].includes(x.c.puzzle))){
  const k=await puzzles[c.puzzle==='2x2'?'3x3x3':ids[c.puzzle]].kpuzzle(),alg=new Alg(normalizeCubeAlg(text,c.puzzle));
  const setup=await initialGripSetup(k,alg,c.puzzle),initial=k.defaultPattern().applyAlg(setup).applyAlg(alg.invert());
  for(const orbit of k.definition.orbits.filter(o=>o.orbitName.startsWith('CENTER')&&o.numPieces===6))assert.deepEqual(initial.patternData[orbit.orbitName].pieces,k.defaultPattern().patternData[orbit.orbitName].pieces,c.id+' '+text);
 }
});
test('Aa Perm starts with canonical up/down centers without modifying either source algorithm',async()=>{
 const k=await puzzles['3x3x3'].kpuzzle();
 for(const source of [rows.find(c=>c.id==='pll-1').algorithm,rows.find(c=>c.id==='pll-1').alternatives.at(-1)]){
  const alg=new Alg(source),setup=await initialGripSetup(k,alg,'3x3');assert.notEqual(setup,'');
  assert.deepEqual(k.defaultPattern().applyAlg(setup).applyAlg(alg.invert()).patternData.CENTERS.pieces,k.defaultPattern().patternData.CENTERS.pieces);
  assert.equal(alg.toString(),new Alg(source).toString());
 }
});
test('every 4x4 algorithm starts with its center blocks in canonical orientation',async()=>{
 const k=await puzzles['4x4x4'].kpuzzle();
 for(const {c,alg:text} of formulas.filter(x=>x.c.puzzle==='4x4')){
  const alg=new Alg(normalizeCubeAlg(text,'4x4')),setup=await initialGripSetup(k,alg,'4x4');
  assert.deepEqual(k.defaultPattern().applyAlg(setup).applyAlg(alg.invert()).patternData.CENTERS.pieces,k.defaultPattern().patternData.CENTERS.pieces,c.id);
 }
});
test('orientation prefixes preserve their moves and original catalog text',()=>{
 const original="[z' y'] Rw U2' Rw2'";
 assert.equal(normalizeCubeAlg(original,'5x5'),"z' y' Rw U2' Rw2'");assert.equal(original,"[z' y'] Rw U2' Rw2'");
});
test('five Cube Shape initial silhouettes match the supplied references up to viewing rotation',()=>{
 const expected=['CECEEEEEEE','CEEEEEEEEC','EEECEECEEE','EECEEEECEE','ECEEECEEEE'];
 function canonical(s){const versions=[];for(const v of [s,[...s].reverse().join('')])for(let i=0;i<v.length;i++)versions.push(v.slice(i)+v.slice(0,i));return versions.sort()[0];}
 for(let n=0;n<5;n++){
  const c=rows.find(c=>c.id===`cs-${n+1}`),{states}=squareTimeline(parseSquare1(c.algorithm));
  const shapes=[1,-1].map(layer=>states[0].pieces.filter(p=>p.layer===layer).sort((a,b)=>a.angle-b.angle).map(p=>p.width===2?'C':'E').join(''));
  assert.equal(canonical(shapes[0]),canonical(expected[n]),c.id);assert.equal(shapes[1],'CCCCCC',c.id);
 }
});
test('all Square-1 snapshots conserve physical pieces and form complete non-overlapping layers',()=>{
 for(const {c,alg} of formulas.filter(x=>x.c.puzzle==='sq1'))for(const state of squareTimeline(parseSquare1(alg)).states){
  assert.equal(new Set(state.pieces.map(p=>p.id)).size,16,c.id);
  for(const layer of [1,-1]){
   const cells=Array(12).fill(0);
   for(const p of state.pieces.filter(p=>p.layer===layer)){
    const start=Math.round(p.angle/(Math.PI/6)-p.width/2);for(let n=0;n<p.width;n++)cells[((start+n)%12+12)%12]++;
   }assert.deepEqual(cells,Array(12).fill(1),c.id);
  }
 }
});
test('Square-1 slice is an involution; malformed notation and cuts across corners are rejected',()=>{
 const s=squareSolved(),twice=squareMove(squareMove(s,{slash:true}),{slash:true});
 for(let i=0;i<16;i++){assert.equal(s.pieces[i].layer,twice.pieces[i].layer);assert.ok(Math.abs(Math.sin(s.pieces[i].angle-twice.pieces[i].angle))<1e-8);}
 assert.throws(()=>parseSquare1('(9,0) /'));assert.throws(()=>parseSquare1('R U'));
 assert.throws(()=>squareMove(squareMove(s,{a:1,b:0}),{slash:true}));
});
