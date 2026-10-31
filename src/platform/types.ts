export type Status='Waiting'|'Running'|'Completed'|'Failed'|'Stopped';
export type Resource={title:string;url:string;source:string;thumbnail?:string;channel?:string;address?:string;lat?:number;lng?:number;note?:string;description?:string};
export type Result={topics?:{id:string;name:string;prerequisites:string[]}[];summary:string;content?:string;resources?:Resource[];flashcards?:{front:string;back:string}[];quiz?:{question:string;options:string[];answer:number;explanation:string}[]};
export type Task={id:string;name:string;agent:string;dependencies:string[];tool:string;status:Status;error?:string;result?:Result;reviewed?:boolean;executionId?:string};
export type Run={revision?:number;id:string;title:string;goal:string;workspace:string;status:Status;execution:string;tasks:Task[];activity:{at:string;message:string}[]};
export type Health={model:string;gemma:boolean;maritime:boolean;youtube:boolean;places:boolean;research:boolean;device:boolean;storage:string};
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{const r=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data;}
