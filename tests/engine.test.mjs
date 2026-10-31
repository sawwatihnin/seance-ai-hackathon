import {test} from 'node:test';
import {exportMarkdown} from '../server/export.mjs';
import assert from 'node:assert/strict';
import {validatePlan} from '../server/schema.mjs';
import {createEngine} from '../server/engine.mjs';
const task=(id,dependencies=[])=>({id,name:id,agent:'Tester',dependencies,tool:'compose',query:id,status:'Waiting'});
const run=tasks=>({id:'test',goal:'test workflow',workspace:'education',status:'Running',execution:'local',tasks,activity:[]});
test('rejects cycles, unknown dependencies and duplicate IDs',()=>{for(const tasks of [[task('a',['a'])],[task('a',['missing'])],[task('a'),task('a')]])assert.throws(()=>validatePlan({title:'Test',tasks}));});
test('independent tasks execute concurrently; dependencies see real results',async()=>{let active=0,max=0;const r=run([task('a'),task('b'),task('c',['a','b'])]);const engine=createEngine({save:()=>{},event:()=>{},execute:async(t,ctx)=>{active++;max=Math.max(active,max);if(t.id==='c')assert.equal(ctx.dependencies.length,2);await new Promise(r=>setTimeout(r,15));active--;return{summary:t.id,content:'done'};}});await engine(r);assert.equal(max,2);assert.equal(r.status,'Completed');});
test('failed dependency prevents downstream execution',async()=>{const r=run([task('a'),task('b',['a'])]);let calls=0;await createEngine({save:()=>{},event:()=>{},execute:async()=>{calls++;throw Error('Provider unavailable')}})(r);assert.equal(calls,1);assert.equal(r.tasks[0].status,'Failed');assert.equal(r.tasks[1].status,'Stopped');assert.equal(r.status,'Failed');});
test('stop discards late local results',async()=>{const r=run([task('a')]);await createEngine({save:()=>{},event:()=>{},execute:async()=>{r.status='Stopped';r.tasks[0].status='Stopped';return{summary:'late',content:'late'}}})(r);assert.equal(r.tasks[0].result,undefined);assert.equal(r.status,'Stopped');});
test('transient provider errors retry; invalid deliverables fail',async()=>{let n=0;const r=run([task('a')]);await createEngine({save:()=>{},event:()=>{},execute:async()=>{if(++n===1)throw Object.assign(Error('busy'),{status:503});return{summary:'done',content:'ok'}}})(r);assert.equal(n,2);assert.equal(r.status,'Completed');const bad=run([task('b')]);await createEngine({save:()=>{},event:()=>{},execute:async()=>({invented:true})})(bad);assert.equal(bad.status,'Failed');});

test('non-education deliverables allow empty optional study aids',async()=>{const r=run([task('launch')]);await createEngine({save:()=>{},event:()=>{},execute:async()=>({summary:'Launch strategy',content:'Draft plan',topics:[],quiz:[],flashcards:[]})})(r);assert.equal(r.status,'Completed');});

test('report export includes actual task output and review state',()=>{const r=run([{...task('report'),reviewed:true,result:{summary:'Verified summary',content:'Actual draft',resources:[{title:'Resource',url:'https://example.org',source:'Test fixture'}]}}]);const md=exportMarkdown({...r,title:'Report'});assert.match(md,/Actual draft/);assert.match(md,/Reviewed: Yes/);assert.match(md,/https:\/\/example.org/);});
