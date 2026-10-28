import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { parseSquare1, squareTimeline, squareIsSolved } from './simulator-notation.mjs';
import { makeSquareGeometry, placeSquareGeometry } from './square1-geometry.mjs';

const Y=new THREE.Vector3(0,1,0),X=new THREE.Vector3(1,0,0),unit=Math.PI/6;
export async function createSquarePlayer(host,text,onUpdate,{fullySolved=false}={}){
 const moves=parseSquare1(text),{states,top,bottom}=squareTimeline(moves,{fullySolved});
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,0.1,100);camera.position.set(5,4.5,6);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Square-1 3D: kéo để đổi góc nhìn');host.replaceChildren(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minDistance=5;controls.maxDistance=12;controls.target.set(0,0,0);controls.update();
 scene.add(new THREE.HemisphereLight(0xffffff,0x667085,2.8));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,8,5);scene.add(light);
 const geometry=makeSquareGeometry(states[0].pieces,top*unit),meshes=geometry.pieces,middle=geometry.middle;
 for(const mesh of [...meshes,...middle])scene.add(mesh);
 let index=0,playing=false,speed=0.75,animation=null,frame=null,disposed=false;
 function display(state){placeSquareGeometry(geometry,state);}
 function update(){onUpdate({index,total:moves.length,playing,solved:fullySolved&&!playing&&index===moves.length&&squareIsSolved(states[index])});}
 function render(){if(!disposed)renderer.render(scene,camera);}
 function stop(){playing=false;cancelAnimationFrame(frame);render();update();}
 function tick(now){
  if(disposed||!playing)return;
  if(!animation){if(index>=moves.length){playing=false;update();return;}animation={from:index,start:now,t:0};}
  const t=Math.min(1,(now-animation.start)/(650/speed)),state=states[index],move=moves[index];animation.t=t;display(state);
  if(move.slash){const q=new THREE.Quaternion().setFromAxisAngle(X,Math.PI*t);state.pieces.forEach((p,i)=>{if(Math.sin(p.angle)>1e-7)meshes[i].quaternion.premultiply(q);});middle[1].quaternion.premultiply(q);}
  else state.pieces.forEach((p,i)=>meshes[i].quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(Y,(p.layer===1?-move.a:move.b)*unit*t)));
  if(t===1){index++;animation=null;display(states[index]);update();}
  render();frame=requestAnimationFrame(tick);
 }
 const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight||340;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();});resize.observe(host);
 controls.addEventListener('change',render);display(states[0]);render();update();
 return {steps:moves.map(m=>m.label),alignment:{top,bottom},
  play(){if(playing)return;if(index===moves.length){index=0;display(states[0]);}if(animation)animation.start=performance.now()-animation.t*650/speed;playing=true;update();frame=requestAnimationFrame(tick);},pause:stop,
  seek(i){stop();animation=null;index=Math.max(0,Math.min(moves.length,i));display(states[index]);render();update();},speed(v){speed=v;if(animation)animation.start=performance.now()-animation.t*650/speed;},resetView(){controls.reset();},
  dispose(){stop();disposed=true;resize.disconnect();controls.dispose();geometry.dispose();renderer.dispose();renderer.forceContextLoss();host.replaceChildren();}
 };
}
