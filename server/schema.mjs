import {z} from 'zod';
export const taskSchema=z.object({id:z.string().regex(/^[a-zA-Z0-9_-]{1,60}$/),name:z.string().min(1).max(160),agent:z.string().min(1).max(80),dependencies:z.array(z.string()).max(12),tool:z.enum(['compose','places','research']),query:z.string().min(1).max(500)});
export const planSchema=z.object({title:z.string().min(1).max(180),tasks:z.array(taskSchema).min(1).max(12)});
function assertAcyclic(items){const ids=new Set(items.map(t=>t.id));if(ids.size!==items.length)throw Error('Duplicate task IDs');const seen=new Set();while(seen.size<ids.size){const next=items.filter(t=>!seen.has(t.id)&&t.dependencies.every(d=>ids.has(d)&&seen.has(d)));if(!next.length)throw Error('Invalid dependencies or cycle in generated plan');next.forEach(t=>seen.add(t.id));}}
export function validatePlan(data){const p=planSchema.parse(data);assertAcyclic(p.tasks);return p;}
export function restrictPlan(plan,tools){const dropped=new Set(plan.tasks.filter(t=>!tools.includes(t.tool)).map(t=>t.id)),tasks=plan.tasks.filter(t=>!dropped.has(t.id)).map(t=>({...t,dependencies:t.dependencies.filter(d=>!dropped.has(d))}));if(!tasks.length)throw Error('Model chose only unavailable tools; generate the plan again');return{...plan,tasks};}
export const deliverableSchema=z.object({summary:z.string(),content:z.string()});
