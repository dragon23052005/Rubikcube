import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {parseSquare1,squareTimeline,squareIsSolved} from '../ui/simulator-notation.mjs';
import {makeSquareGeometry,placeSquareGeometry,SQUARE_SIDE_COLORS} from '../ui/square1-geometry.mjs';
import {TOP_STICKER_COLOR,BOTTOM_STICKER_COLOR} from '../ui/simulator-colors.mjs';
const data=JSON.parse(readFileSync('src/main/resources/static/data.json','utf8'));
const oracle=JSON.parse(readFileSync('src/test/resources/square1-ep-oracle.json','utf8'));
const cases=(Array.isArray(data)?data:data.cases).filter(c=>c.method==='EP');
const ids=[6,5,4,3,2,1,0,7,9,10,11,12,13,14,15,8];
test('All 54 EP starting positions match independent TNoodle permutations and middle',()=>{
 assert.equal(cases.length,54);assert.equal(oracle.cases.length,54);
 for(const c of cases){
  const ref=oracle.cases.find(r=>r.id===c.id),moves=parseSquare1(c.algorithm),{states}=squareTimeline(moves,{fullySolved:true});
  assert.equal(createHash('sha256').update(c.algorithm).digest('hex'),ref.algorithmSha256,c.id);
  const pieces=[];
  for(const layer of [1,-1])for(let slot=0;slot<12;slot++){
   const angle=(layer===1?-1:1)*(slot+.5)*Math.PI/6;
   const p=states[0].pieces.find(p=>p.layer===layer&&Math.abs(Math.atan2(Math.sin(angle-p.angle),Math.cos(angle-p.angle)))<p.width*Math.PI/12-1e-8);
   assert.ok(p,c.id);pieces.push(ids[p.id]);
  }
  assert.deepEqual(pieces,ref.pieces,c.id);assert.equal(!!states[0].middle,ref.middleFlipped,c.id);
  assert.equal(states.length,moves.length+1);assert.ok(squareIsSolved(states.at(-1)),c.id);
 }
});
test('Actual final meshes have six uniform complete faces, with unchanged stickers',()=>{
 for(const c of cases){
  const {states,top}=squareTimeline(parseSquare1(c.algorithm),{fullySolved:true}),yaw=top*Math.PI/6;
  const g=makeSquareGeometry(states[0].pieces,yaw),meshes=[...g.pieces,...g.middle];
  const before=meshes.map(m=>Array.from(m.geometry.attributes.color.array));
  placeSquareGeometry(g,states.at(-1));
  const areas=Array(6).fill(0),expected=[TOP_STICKER_COLOR,BOTTOM_STICKER_COLOR,...SQUARE_SIDE_COLORS];
  for(const mesh of meshes){
   const pos=mesh.geometry.attributes.position,col=mesh.geometry.attributes.color;
   for(let j=0;j<pos.count;j+=3){
    const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,j+k).applyQuaternion(mesh.quaternion));
    let face=-1;
    if(v.every(p=>Math.abs(p.y-.98)<1e-6))face=0;
    else if(v.every(p=>Math.abs(p.y+.98)<1e-6))face=1;
    else for(let i=0;i<4;i++){const a=yaw-Math.PI/12+i*Math.PI/2;if(v.every(p=>Math.abs(p.x*Math.sin(a)+p.z*Math.cos(a)-1)<1e-6)){face=i+2;break;}}
    if(face<0)continue;
    const color=new THREE.Color(expected[face]);
    for(let k=0;k<3;k++)for(const [axis,value] of [['X',color.r],['Y',color.g],['Z',color.b]])assert.ok(Math.abs(col['get'+axis](j+k)-value)<1e-6,`${c.id} face ${face} color`);
    areas[face]+=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()/2;
   }
  }
  areas.forEach((a,i)=>assert.ok(Math.abs(a-(i<2?4:3.82))<1e-5,`${c.id} face ${i} area ${a}`));
  meshes.forEach((m,i)=>assert.deepEqual(Array.from(m.geometry.attributes.color.array),before[i]));
  g.dispose();
 }
});
