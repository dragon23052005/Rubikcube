export const HOLD_MS=550;
export function inspectionPenalty(ms){return ms==null||ms<15000?'NONE':ms<17000?'PLUS2':'DNF';}
export function resultMs(solve){
 const auto=inspectionPenalty(solve.inspectionMs);
 return solve.penalty==='DNF'||auto==='DNF'?Infinity:Math.floor(solve.elapsedMs/10)*10+(auto==='PLUS2'?2000:0)+(solve.penalty==='PLUS2'?2000:0);
}
export function formatTime(ms){
 if(ms==null)return '—';if(!Number.isFinite(ms))return 'DNF';
 const centis=Math.max(0,Math.floor(ms/10)),cs=String(centis%100).padStart(2,'0'),s=Math.floor(centis/100),seconds=String(s%60).padStart(2,'0');
 return s<60?`${s}.${cs}`:s<3600?`${Math.floor(s/60)}:${seconds}.${cs}`:`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${seconds}.${cs}`;
}
export function averageOf(rows,n){
 const values=rows.filter(r=>!r.deleted).slice(0,n).map(resultMs).sort((a,b)=>a-b);
 if(values.length<n)return null;
 const kept=values.slice(1,-1);if(kept.some(v=>!Number.isFinite(v)))return Infinity;
 return Math.round(kept.reduce((a,b)=>a+b,0)/(n-2)/10)*10;
}
export function timerStats(rows){
 const values=rows.filter(r=>!r.deleted).map(resultMs);
 return {count:values.length,best:values.length?Math.min(...values):null,ao5:averageOf(rows,5),ao12:averageOf(rows,12)};
}
export class TimerMachine {
 constructor({inspection=true}={}){this.inspection=inspection;this.reset();}
 reset(){this.phase='idle';this.inspectionStart=null;this.holdStart=null;this.solveStart=null;this.inspectionMs=null;this.result=null;}
 press(now){
  this.tick(now);if(this.phase==='stopped')return;
  if(this.phase==='running'){this.finish(now);return;}
  if(this.phase==='idle'&&this.inspection){this.inspectionStart=now;this.phase='inspection';return;}
  if(this.phase==='idle'||this.phase==='inspection'){this.holdStart=now;this.phase='holding';}
 }
 release(now){
  this.tick(now);
  if(this.phase==='ready'){
   this.inspectionMs=this.inspectionStart==null?null:Math.floor(now-this.inspectionStart);
   this.solveStart=now;this.phase='running';this.holdStart=null;
  }else if(this.phase==='holding')this.cancelHold();
 }
 cancelHold(){if(this.phase==='holding'||this.phase==='ready'){this.phase=this.inspectionStart==null?'idle':'inspection';this.holdStart=null;}}
 tick(now){
  if(['inspection','holding','ready'].includes(this.phase)&&this.inspectionStart!=null&&now-this.inspectionStart>=17000){
   this.inspectionMs=Math.floor(now-this.inspectionStart);this.result={elapsedMs:0,inspectionMs:this.inspectionMs,penalty:'NONE'};this.phase='stopped';return;
  }
  if(this.phase==='holding'&&now-this.holdStart>=HOLD_MS)this.phase='ready';
 }
 finish(now,dnf=false){
  if(this.phase!=='running')return;
  this.result={elapsedMs:Math.min(86_400_000,Math.max(0,Math.floor((now-this.solveStart)/10)*10)),inspectionMs:this.inspectionMs,penalty:dnf?'DNF':'NONE'};this.phase='stopped';
 }
 elapsed(now){return this.phase==='running'?Math.max(0,now-this.solveStart):this.result?.elapsedMs??0;}
}
