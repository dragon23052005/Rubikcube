// Change the sticker palette, not the puzzle axes: U/D and every move keep
// their existing meaning, including algorithms containing x/y/z rotations.
export const TOP_STICKER_COLOR=0xffff00;
export const BOTTOM_STICKER_COLOR=0xffffff;
export function yellowUpWhiteDown(object){
 const clones=new Map();
 function recolor(original){
  if(clones.has(original))return clones.get(original);
  const material=original.clone(),beforeCompile=original.onBeforeCompile;
  material.onBeforeCompile=function(shader,renderer){
   beforeCompile.call(this,shader,renderer);
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if (diffuseColor.r > 0.99 && diffuseColor.g > 0.99) {
      if (diffuseColor.b > 0.99) diffuseColor.rgb = vec3(1.0, 1.0, 0.0);
      else if (diffuseColor.b < 0.01) diffuseColor.rgb = vec3(1.0);
    }`);
  };
  material.customProgramCacheKey=()=>original.customProgramCacheKey()+':yellow-up-white-down';
  material.needsUpdate=true;clones.set(original,material);return material;
 }
 object.traverse(node=>{if(node.isMesh&&node.material)node.material=Array.isArray(node.material)?node.material.map(recolor):recolor(node.material);});
 return ()=>{for(const material of clones.values())material.dispose();};
}
