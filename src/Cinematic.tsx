import {Link,useNavigate} from 'react-router-dom';
import {Component,useCallback,useEffect,useState,type ReactNode} from 'react';
import {IntroExperience} from './components/IntroExperience';
class RenderBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true}};
 render(){return this.state.failed?<div className="loading render-error"><p>The séance could not be loaded.</p><p>Use a WebGL-enabled browser for the cinematic, or enter the portal.</p><button onClick={()=>location.reload()}>Try again</button><Link to="/portal">Enter the portal</Link></div>:this.props.children}
}
export default function Cinematic(){
 const navigate=useNavigate();
 const [run,setRun]=useState(0);const [ready,setReady]=useState(false);const [done,setDone]=useState(false);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const fn=()=>setReduced(m.matches);m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn)},[]);
 useEffect(()=>{if(!done)return;const timer=setTimeout(()=>navigate('/portal'),reduced?0:1000);return()=>clearTimeout(timer)},[done,navigate,reduced]);
 const onReady=useCallback(()=>setReady(true),[]);const onComplete=useCallback(()=>setDone(true),[]);
 return <main className={`${ready?'is-ready':''} ${done?'is-finished':''}`}>
  <RenderBoundary><IntroExperience run={run} reduced={reduced} onReady={onReady} onComplete={onComplete}/></RenderBoundary>
  <header><a className="wordmark" href="#" aria-label="The House Beneath">THB<span>EST. OCTOBER 31</span></a><span className="edition">AN ALL HALLOWS’ EVE EXPERIENCE</span><span className="mark">✧</span></header>
  <div className="landing-copy" aria-hidden={!done}><p className="eyebrow">YOU HAVE BEEN EXPECTED</p><h1>The House<br/><i>Beneath.</i></h1><p className="invitation">Some doors open only from the other side.</p></div>
  <div className={`cinematic-exit ${done?'visible':''}`} aria-hidden="true"/>
  <footer><span className="caption">{done?'THE SÉANCE HAS BEGUN':'A FIFTEEN-SECOND DESCENT'}</span><button aria-label="Skip cinematic and enter portal" disabled={!ready} onClick={()=>{if(done){setDone(false);setRun(n=>Math.abs(n)+1)}else{setRun(-1);setDone(true)}}}>{done?'Replay intro':'Skip intro'}<span aria-hidden="true">↗</span></button><span className="chapter">{done?'IV / THE OTHER SIDE':'I — IV / ENTER THE DARK'}</span></footer>
 </main>;
}
