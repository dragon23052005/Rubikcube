import test from 'node:test';
import assert from 'node:assert/strict';
import {TimerMachine,inspectionPenalty,resultMs,averageOf,formatTime} from '../src/main/resources/static/timer-core.mjs';
const row=(elapsedMs,penalty='NONE',inspectionMs=null)=>({elapsedMs,penalty,inspectionMs});
test('inspection boundaries: exactly 15.00 is +2; exactly 17.00 is DNF',()=>{
 assert.equal(inspectionPenalty(14999),'NONE');assert.equal(inspectionPenalty(15000),'PLUS2');assert.equal(inspectionPenalty(16999),'PLUS2');assert.equal(inspectionPenalty(17000),'DNF');
});
test('hold/release gates start; short press and cancelling a hold do not start',()=>{
 const m=new TimerMachine({inspection:false});m.press(100);m.release(649);assert.equal(m.phase,'idle');
 m.press(1000);m.tick(1550);assert.equal(m.phase,'ready');m.cancelHold();assert.equal(m.phase,'idle');
 m.press(2000);m.release(2550);assert.equal(m.phase,'running');m.press(4267);assert.equal(m.result.elapsedMs,1710);
});
test('hold time counts towards inspection; solution time starts on release',()=>{
 const m=new TimerMachine();m.press(0);m.release(20);assert.equal(m.phase,'inspection');
 m.press(14500);m.release(15050);assert.equal(m.inspectionMs,15050);assert.equal(m.phase,'running');
 m.press(17490);assert.equal(m.result.elapsedMs,2440);assert.equal(resultMs(m.result),4440);
});
test('inspection expiry completes only one DNF and does not start on later release',()=>{
 const m=new TimerMachine();m.press(0);m.press(16500);m.release(17050);assert.equal(m.phase,'stopped');assert.equal(resultMs(m.result),Infinity);assert.equal(m.result.elapsedMs,0);
 const result=m.result;m.tick(19000);m.press(20000);m.release(20550);assert.equal(m.result,result);
});
test('long periods without animation frames still count; forced DNF keeps raw time',()=>{
 const m=new TimerMachine({inspection:false});m.press(0);m.release(550);m.finish(90555,true);assert.equal(m.result.elapsedMs,90000);assert.equal(resultMs(m.result),Infinity);
});
test('manual and inspection penalties are cumulative and DNF wins',()=>{
 assert.equal(resultMs(row(10000,'PLUS2',15000)),14000);assert.equal(resultMs(row(10000,'NONE',15000)),12000);assert.equal(resultMs(row(10000,'PLUS2',17000)),Infinity);
});
test('ao5 trims best/worst, handles one or two DNFs, and includes penalties before sorting',()=>{
 assert.equal(averageOf([row(10000),row(11000),row(12000),row(13000),row(99999)],5),12000);
 assert.equal(averageOf([row(10000),row(11000),row(12000),row(13000),row(0,'DNF')],5),12000);
 assert.equal(averageOf([row(10000),row(11000),row(12000),row(0,'DNF'),row(0,'DNF')],5),Infinity);
 assert.equal(averageOf([row(10000,'PLUS2'),row(11000),row(12000),row(13000),row(14000)],5),12330);
 assert.equal(averageOf([row(10000)],5),null);
});
test('ao12 uses the latest twelve; deleted attempts do not count; averages round to hundredths',()=>{
 const rows=Array.from({length:12},(_,i)=>row((i+1)*1000));assert.equal(averageOf(rows,12),6500);
 assert.equal(averageOf([{...row(1),deleted:true},...rows,row(900000)],12),6500);
 assert.equal(formatTime(62019),'1:02.01');assert.equal(formatTime(Infinity),'DNF');assert.equal(formatTime(null),'—');
});
