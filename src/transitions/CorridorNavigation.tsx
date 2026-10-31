import {Component,lazy,Suspense,useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {CHARACTERS,LOAD_TIMEOUT_MS,TRANSITION_SECONDS,type Workspace} from './config';
import './corridor.css';
const Scene=lazy(()=>import('./HorrorCorridorTransition'));
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}
export default function CorridorNavigation({destination,onComplete}:{destination:Workspace;onComplete:()=>void}) {
  const [ready,setReady]=useState(false);
  const button=useRef<HTMLButtonElement>(null);
  const finished=useRef(false);
  const finish=useCallback(()=>{if(!finished.current){finished.current=true;onComplete();}},[onComplete]);
  const markReady=useCallback(()=>setReady(true),[]);
  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';button.current?.focus();
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{if(preference.matches)finish();};change();preference.addEventListener('change',change);
    return()=>{document.body.style.overflow=overflow;preference.removeEventListener('change',change);if(previous?.isConnected)previous.focus();};
  },[finish]);
  useEffect(()=>{
    // Bound both module/asset loading and an unresponsive render loop.
    const timer=setTimeout(finish,ready?(TRANSITION_SECONDS+1)*1000:LOAD_TIMEOUT_MS);
    return()=>clearTimeout(timer);
  },[ready,finish]);
  return <div className="corridor-transition" role="dialog" aria-modal="true" aria-labelledby="corridor-title" data-destination={destination} data-character={CHARACTERS[destination].name} data-phase={ready?'playing':'loading'} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){e.preventDefault();button.current?.focus();}}}>
    <SceneBoundary onFailure={finish}><Suspense fallback={null}><Scene destination={destination} onComplete={finish} onReady={markReady}/></Suspense></SceneBoundary>
    <div className="corridor-caption" role="status"><span id="corridor-title">{ready?'A door opens to':'Preparing the passage to'} {destination}</span><small>{ready?CHARACTERS[destination].name:'Loading the corridor. You can skip at any time.'}</small></div>
    <button ref={button} className="corridor-skip" onClick={finish}>Skip Transition <span aria-hidden="true">↗</span></button>
  </div>;
}
