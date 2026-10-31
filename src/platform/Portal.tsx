import {useCallback,useEffect,useState,type MouseEvent} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import CorridorNavigation from '../transitions/CorridorNavigation';
import {preloadCorridor} from '../transitions/preload';
import type {Workspace} from '../transitions/config';
import './portal.css';
const entries=[['community','cm2.png'],['education','edu.png'],['business','busi.png']] as const;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function PortalImage({name,file,onSelect}:{name:Workspace;file:string;onSelect:(event:MouseEvent<HTMLAnchorElement>,destination:Workspace)=>void}){
  const [failed,setFailed]=useState(false);
  const warm=()=>{if(!reduced())preloadCorridor(name);};
  return <Link to={'/'+name} aria-label={`Enter ${name} workspace`} className="portal-link" onClick={event=>onSelect(event,name)} onPointerEnter={warm} onFocus={warm}>
    {failed?<span className="asset-missing">{name} — navigation artwork unavailable</span>:<img src={'/portal/'+file} alt="" width={2172} height={724} decoding="async" onError={()=>setFailed(true)}/>}
  </Link>;
}
export default function Portal(){
  const navigate=useNavigate();
  const [destination,setDestination]=useState<Workspace|null>(null);
  useEffect(()=>{
    if(reduced())return;
    const network=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
    if(network?.saveData)return;
    const timer=setTimeout(()=>preloadCorridor(),1200);
    return()=>clearTimeout(timer);
  },[]);
  const complete=useCallback(()=>{if(destination)navigate('/'+destination);},[destination,navigate]);
  const select=(event:MouseEvent<HTMLAnchorElement>,workspace:Workspace)=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced())return;
    event.preventDefault();
    if(!destination)setDestination(workspace);
  };
  return <>
    <div className="platform portal" inert={destination!==null}>
      <div className="portal-masthead"><span className="portal-brand">Seance.AI</span><Link className="portal-replay" to="/">replay the séance</Link></div>
      <nav className="portal-navigation" aria-label="Choose your workspace">{entries.map(([name,file])=><PortalImage key={name} name={name} file={file} onSelect={select}/>)}</nav>
      <p className="slogan">connecting the world of the dead (developers) &amp; the world of the living (literally anyone else)</p>
    </div>
    {destination&&<CorridorNavigation destination={destination} onComplete={complete}/>}
  </>;
}
