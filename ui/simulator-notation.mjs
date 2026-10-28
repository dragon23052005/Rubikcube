// Preserve the catalog text; normalize only notation with a documented source meaning.
export function normalizeCubeAlg(text, puzzle) {
 let alg = text.trim().replace(/[’′]/g, "'");
 // CubeSkills' [z' y'] is an orientation prefix, not a commutator.
 alg = alg.replace(/\[\s*((?:[xyz](?:2'?|')?\s*)+)\]/g, '$1');
 // This catalog defines M on 4x4 as BOTH inner layers, turning like L.
 if (puzzle === '4x4') alg = alg.replace(/\bM(2'?|')?/g, (_, suffix='') => `2-3Lw${suffix}`);
 return alg;
}
export function parseSquare1(text) {
 const moves=[];let rest=text.trim();
 while(rest){
  const match=rest.match(/^(?:\/|\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\))/);
  if(!match) throw new Error('Ký hiệu Square-1 chưa được hỗ trợ.');
  if(match[0]==='/')moves.push({slash:true,label:'/'});
  else {const a=Number(match[1]),b=Number(match[2]);if(Math.abs(a)>6||Math.abs(b)>6)throw new Error('Góc xoay Square-1 vượt phạm vi.');moves.push({a,b,label:`(${a},${b})`});}
  rest=rest.slice(match[0].length).trim();
 }
 if(!moves.length)throw new Error('Case chưa có công thức.');
 return moves;
}
const unit=Math.PI/6, wrap=a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
export function squareSolved(top=0,bottom=0){
 const pieces=[];
 for(const layer of [1,-1]){let slot=0;for(let n=0;n<8;n++){
  const width=n%2===0?2:1,angle=(slot+width/2+(layer===1?top:bottom))*unit;
  pieces.push({id:pieces.length,width,angle:wrap(angle),homeAngle:angle,homeOffset:(layer===1?top:bottom)*unit,layer,homeLayer:layer});slot+=width;
 }}
 return {pieces,middle:0};
}
export function squareMove(state, move) {
 const next={pieces:state.pieces.map(p=>({...p})),middle:state.middle};
 if(move.slash){
  for(const p of next.pieces){
   const left=Math.sin(p.angle-p.width*unit/2),right=Math.sin(p.angle+p.width*unit/2);
   if(left*right < -1e-8)throw new Error('Lát cắt đi qua một góc Square-1.');
  }
  for(const p of next.pieces)if(Math.sin(p.angle)>1e-7){p.angle=wrap(Math.PI-p.angle);p.layer=-p.layer;}
  next.middle^=1;
 } else for(const p of next.pieces)p.angle=wrap(p.angle+(p.layer===1?-move.a:move.b)*unit);
 return next;
}
export function squareIsSolved(state){
 const yaw=state.pieces[0]?.homeOffset;
 return state.middle===0&&state.pieces.every(p=>p.layer===p.homeLayer&&Math.abs(Math.atan2(Math.sin(p.angle-p.homeAngle),Math.cos(p.angle-p.homeAngle)))<1e-8&&Math.abs(p.homeOffset-yaw)<1e-8);
}
export function squareTimeline(moves,{fullySolved=false}={}){
 // Some shape algorithms finish at an implicit top/bottom alignment (AUF).
 // Find a square-shape endpoint from which every inverse slice is physically legal.
 const offsets=[0,1,-1,2,-2,3,-3,4,-4,5,-5,6];
 const alignments=fullySolved?[[1,1]]:offsets.flatMap(top=>offsets.map(bottom=>[top,bottom]));
 for(const [top,bottom] of alignments){
  let end=squareSolved(top,bottom),start=end;
  try{
   for(const move of [...moves].reverse())start=squareMove(start,move.slash?move:{a:-move.a,b:-move.b});
   const states=[start];for(const move of moves)states.push(squareMove(states.at(-1),move));
   if(fullySolved&&!squareIsSolved(states.at(-1)))throw new Error('Trạng thái đích EP chưa hoàn thành.');
   return {states,top,bottom};
  }catch{/* Try another legal square-shape endpoint; never animate an illegal cut. */}
 }
 throw new Error('Chưa xác nhận được hướng cắt hợp lệ cho công thức này.');
}
