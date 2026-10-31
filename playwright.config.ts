import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {defineConfig} from '@playwright/test';
const dataDir=mkdtempSync(join(tmpdir(),'seance-browser-tests-'));
writeFileSync(join(dataDir,'browser-fixture.json'),JSON.stringify({id:'browser-fixture',title:'Browser test fixture',goal:'Test saved output review',workspace:'education',execution:'local',status:'Completed',createdAt:new Date().toISOString(),activity:[{at:new Date().toISOString(),message:'Test fixture only'}],tasks:[{id:'source',name:'Read source',agent:'Test researcher',dependencies:[],tool:'books',status:'Completed',result:{summary:'Test source output',resources:[]}},{id:'notes',name:'Review notes',agent:'Test tutor',dependencies:['source'],tool:'compose',status:'Completed',result:{summary:'Test notes output',content:'Notes from injected browser test fixture.'}}]}));
export default defineConfig({testDir:'tests',testMatch:'*.spec.ts',timeout:60000,use:{baseURL:'http://127.0.0.1:3002',headless:true,channel:'chromium',launchOptions:{args:process.platform==='darwin'?['--use-angle=metal']:[]},viewport:{width:1280,height:720}},webServer:{command:'node server/index.mjs',env:{PORT:'3002',DATA_DIR:dataDir},url:'http://127.0.0.1:3002/api/health',reuseExistingServer:false}});
