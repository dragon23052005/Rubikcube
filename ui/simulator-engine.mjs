import { Alg, Move } from 'cubing/alg';
import { puzzles } from 'cubing/puzzles';
import { TwistyPlayer } from 'cubing/twisty';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { normalizeCubeAlg } from './simulator-notation.mjs';
import { yellowUpWhiteDown } from './simulator-colors.mjs';
import { initialGripSetup } from './simulator-orientation.mjs';

export async function createCubePlayer(host, text, puzzle, onUpdate){
 const puzzleId={'2x2':'2x2x2','3x3':'3x3x3','4x4':'4x4x4','5x5':'5x5x5'}[puzzle];
 if(!puzzleId)throw new Error('Loại Rubik chưa được hỗ trợ.');
 const alg=new Alg(normalizeCubeAlg(text,puzzle));
 const kpuzzle=await puzzles[puzzleId].kpuzzle();
 // Validate every move against the actual puzzle, including wide and inner slices.
 kpuzzle.algToTransformation(alg);
 const steps=Array.from(alg.experimentalExpand()).filter(n=>n instanceof Move);
 if(!steps.length)throw new Error('Case chưa có bước xoay.');
 const setup=await initialGripSetup(kpuzzle,alg,puzzle);
 const player=new TwistyPlayer({puzzle:puzzleId,alg,experimentalSetupAlg:setup,experimentalSetupAnchor:'end',
  visualization:'3D',background:'none',controlPanel:'none',viewerLink:'none',hintFacelets:'none',tempoScale:0.75});
 player.style.width='100%';player.style.height='340px';
 player.experimentalSetFlashLevel('none');
 player.setAttribute('aria-label','Mô phỏng 3D các bước xoay công thức');
 host.replaceChildren(player);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,0.1,100);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',`Rubik ${puzzle} 3D: kéo để đổi góc nhìn`);
 let disposed=false,disposePalette=()=>{};
 const render=()=>{if(!disposed)renderer.render(scene,camera);};
 let readyTimer;
 try {
  const object=await Promise.race([player.experimentalCurrentThreeJSPuzzleObject(render),new Promise((_,reject)=>{readyTimer=setTimeout(()=>reject(new Error('Bộ dựng 3D chưa sẵn sàng. Vui lòng thử lại.')),12000);})]);
  disposePalette=yellowUpWhiteDown(object);scene.add(object);
  const size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()).length();
  camera.position.set(size*1.1,size*0.9,size*1.4);camera.lookAt(0,0,0);
 } catch(error){disposed=true;disposePalette();renderer.dispose();player.pause();player.remove();throw error;}
 finally{clearTimeout(readyTimer);}
 scene.add(new THREE.HemisphereLight(0xffffff,0x667085,2.5));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(4,8,5);scene.add(light);
 // Adopt cubing.js's actual puzzle object into our canvas. This avoids blank
 // pooled canvases in embedded browsers while retaining its puzzle kinematics.
 player.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';player.setAttribute('aria-hidden','true');
 host.appendChild(renderer.domElement);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.enablePan=false;orbit.minDistance=camera.position.length()*0.65;orbit.maxDistance=camera.position.length()*1.8;orbit.addEventListener('change',render);
 const resize=new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight||340;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();});resize.observe(host);render();
 const model=player.experimentalModel,indexer=await model.indexer.get();
 let index=0,playing=false;
 const timeline=(info)=>{if(disposed)return;index=info.atEnd?steps.length:info.atStart?0:Math.min(steps.length,indexer.timestampToIndex(info.timestamp+0.001));onUpdate({index,total:steps.length,playing});render();};
 const playback=info=>{playing=info.playing;if(!disposed)onUpdate({index,total:steps.length,playing});};
 model.detailedTimelineInfo.addFreshListener(timeline);model.playingInfo.addFreshListener(playback);
 player.jumpToStart();
 return {
  steps:steps.map(m=>m.toString()),
  play(){if(index>=steps.length)player.jumpToStart();player.play();},pause(){player.pause();},
  seek(i){player.pause();player.timestamp=indexer.indexToMoveStartTimestamp(Math.max(0,Math.min(steps.length,i)));},
  speed(value){player.tempoScale=value;},
  resetView(){orbit.reset();},
  dispose(){disposed=true;player.pause();model.detailedTimelineInfo.removeFreshListener(timeline);model.playingInfo.removeFreshListener(playback);resize.disconnect();orbit.dispose();disposePalette();renderer.dispose();renderer.forceContextLoss();player.remove();renderer.domElement.remove();}
 };
}
