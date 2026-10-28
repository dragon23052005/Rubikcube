import * as THREE from 'three';
import { TOP_STICKER_COLOR, BOTTOM_STICKER_COLOR } from './simulator-colors.mjs';
const Y=new THREE.Vector3(0,1,0),X=new THREE.Vector3(1,0,0),unit=Math.PI/6;
export const SQUARE_SIDE_COLORS=Object.freeze([0x23b573,0xef5350,0x3b82f6,0xf59e0b]);
export function squareOutlinePoint(angle,offset=0){const a=angle-offset+Math.PI/12,r=1/Math.max(Math.abs(Math.sin(a)),Math.abs(Math.cos(a)));return [r*Math.sin(angle),r*Math.cos(angle)];}
// A sticker's home color belongs to a cube FACE PLANE. Using the polar angle
// of its midpoint wrongly gives two colors to one face and colors inner cuts.
export function squareSideFace(a,b,yaw){
 for(let i=0;i<4;i++){
  const angle=yaw-Math.PI/12+i*Math.PI/2,nx=Math.sin(angle),nz=Math.cos(angle);
  if(Math.abs(a[0]*nx+a[1]*nz-1)<1e-7&&Math.abs(b[0]*nx+b[1]*nz-1)<1e-7)return i;
 }
 return -1;
}
function prism(points,bottom,top,color,yaw){
 const vertices=[],colors=[];
 function triangle(a,b,c,hex){const shade=new THREE.Color(hex);for(const v of [a,b,c]){vertices.push(...v);colors.push(shade.r,shade.g,shade.b);}}
 const center=points.reduce((s,p)=>[s[0]+p[0]/points.length,s[1]+p[1]/points.length],[0,0]);
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],at=[a[0],top,a[1]],bt=[b[0],top,b[1]],ab=[a[0],bottom,a[1]],bb=[b[0],bottom,b[1]];
  triangle([center[0],top,center[1]],bt,at,color.top);triangle([center[0],bottom,center[1]],ab,bb,color.bottom);
  const face=squareSideFace(a,b,yaw),side=face<0?0x202531:SQUARE_SIDE_COLORS[face];
  triangle(at,bt,bb,side);triangle(at,bb,ab,side);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.7,side:THREE.DoubleSide}));
 mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),new THREE.LineBasicMaterial({color:0x222734})));return mesh;
}
export function squarePiecePose(piece){
 if(piece.layer===piece.homeLayer)return new THREE.Quaternion().setFromAxisAngle(Y,piece.angle-piece.homeAngle);
 return new THREE.Quaternion().setFromAxisAngle(Y,piece.angle-(Math.PI-piece.homeAngle)).multiply(new THREE.Quaternion().setFromAxisAngle(X,Math.PI));
}
function clipX(points,positive){
 const out=[];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],inA=positive?a[0]>=0:a[0]<=0,inB=positive?b[0]>=0:b[0]<=0;
  if(inA)out.push(a);if(inA!==inB){const t=-a[0]/(b[0]-a[0]);out.push([0,a[1]+t*(b[1]-a[1])]);}
 }return out;
}
export function makeSquareGeometry(homePieces,yaw){
 const pieces=homePieces.map(piece=>{
  const first=piece.homeAngle-piece.width*unit/2,last=piece.homeAngle+piece.width*unit/2;
  const points=[[0,0],squareOutlinePoint(first,piece.homeOffset)];if(piece.width===2)points.push(squareOutlinePoint(piece.homeAngle,piece.homeOffset));points.push(squareOutlinePoint(last,piece.homeOffset));
  const top=piece.homeLayer===1;
  return prism(points,top?0.24:-0.98,top?0.98:-0.24,{top:top?TOP_STICKER_COLOR:0x232937,bottom:top?0x232937:BOTTOM_STICKER_COLOR},piece.homeOffset);
 });
 const square=[0,1,2,3].map(i=>squareOutlinePoint(Math.PI/6+i*Math.PI/2+yaw,yaw));
 const middle=[false,true].map(positive=>prism(clipX(square,positive),-0.215,0.215,{top:0x454b59,bottom:0x454b59},yaw));
 return {pieces,middle,dispose(){for(const mesh of [...pieces,...middle])mesh.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
}
export function placeSquareGeometry(geometry,state){
 state.pieces.forEach((p,i)=>geometry.pieces[i].quaternion.copy(squarePiecePose(p)));
 geometry.middle[1].quaternion.setFromAxisAngle(X,state.middle*Math.PI);
}
