import gsap from 'gsap';
export type FilmState = {time:number};
export const DURATION=15;
export function createIntroTimeline(state:FilmState,onComplete:()=>void){
 state.time=0;
 return gsap.timeline({onComplete}).to(state,{time:DURATION,duration:DURATION,ease:'none'});
}
export const smooth=(a:number,b:number,t:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p)};
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
