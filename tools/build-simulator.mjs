import { build } from 'esbuild';
import { mkdir, writeFile, copyFile, readdir, unlink } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
const out='src/main/resources/static/vendor/simulator';
await mkdir(out,{recursive:true});
await mkdir('target',{recursive:true});
await build({entryPoints:{cube:'ui/simulator-engine.mjs',square1:'ui/square1-engine.mjs'},outdir:out,
 bundle:true,splitting:true,format:'esm',platform:'browser',target:'es2022',minify:true,
 chunkNames:'chunks/[name]-[hash]',legalComments:'eof',metafile:true}).then(async result=>{
 await writeFile('target/simulator-build.json',JSON.stringify(result.metafile));
 // Only remove obsolete generated JS inside this exact output directory.
 const root=resolve(out),keep=new Set(Object.keys(result.metafile.outputs).map(p=>resolve(p)));
 async function prune(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=join(dir,entry.name);if(!resolve(file).startsWith(root+sep))throw new Error('Output path outside simulator directory');
  if(entry.isDirectory())await prune(file);
  else if(entry.isFile()&&file.endsWith('.js')&&!keep.has(resolve(file)))await unlink(file);
 }}
 await prune(root);
});
await copyFile('node_modules/three/LICENSE',out+'/Three-LICENSE.txt');
await writeFile(out+'/NOTICE.txt','cubing.js 0.66.1, MPL-2.0 OR GPL-3.0-or-later\nSource: https://github.com/cubing/cubing.js/tree/v0.66.1\nLicense: https://github.com/cubing/cubing.js/blob/v0.66.1/LICENSE-MPL.md\nThree.js: MIT; see Three-LICENSE.txt\nBundled unmodified library code; application adapters are in ui/.\n');
