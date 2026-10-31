import {configureModelLoader} from './modelLoader';
import {Suspense,useEffect,useRef} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {useGLTF,useProgress} from '@react-three/drei';
import {SpookyHouse} from './SpookyHouse';
import {OuijaScene} from './OuijaScene';
import {CinematicCamera} from './CinematicCamera';
import {ForestEnvironment} from './ForestEnvironment';
import {Atmosphere} from './Atmosphere';
import {createIntroTimeline,FilmState,smooth} from '../timeline/createIntroTimeline';
import type {RefObject} from 'react';
function Film({run,reduced,onReady,onComplete,veil,progress}:{run:number;reduced:boolean;onReady:()=>void;onComplete:()=>void;veil:RefObject<HTMLDivElement|null>;progress:RefObject<HTMLDivElement|null>}){
 const film=useRef<FilmState>({time:0});
 useEffect(()=>{
  onReady();
  const frame=import.meta.env.DEV ? new URLSearchParams(location.search).get('frame') : null;
  if(frame!==null && Number.isFinite(Number(frame))){film.current.time=Math.max(0,Math.min(15,Number(frame)));if(film.current.time===15)onComplete();return;}
  if(reduced||run<0){film.current.time=15;onComplete();return;}
  const tl=createIntroTimeline(film.current,onComplete);return()=>{tl.kill()};
 },[run,reduced,onReady,onComplete]);
 useFrame(()=>{
  const t=film.current.time;
  const opacity=t<3?1-smooth(0,2.3,t):t<10?smooth(9.35,9.75,t):1-smooth(10.15,11.5,t);
  if(veil.current)veil.current.style.opacity=String(opacity);
  if(progress.current)progress.current.style.transform=`scaleX(${t/15})`;
 });
 return <><ForestEnvironment film={film.current}/><SpookyHouse film={film.current}/><OuijaScene film={film.current}/><Atmosphere film={film.current}/><CinematicCamera film={film.current}/></>;
}
function Loading(){const {progress}=useProgress();return <div className="loading" role="status"><div className="sigil">✧</div><p>PREPARING THE SÉANCE</p><span>{Math.round(progress)}%</span></div>}
export function IntroExperience(props:{run:number;reduced:boolean;onReady:()=>void;onComplete:()=>void}){
 const veil=useRef<HTMLDivElement>(null);const progress=useRef<HTMLDivElement>(null);
 return <><Canvas dpr={[1,1.75]} camera={{position:[0,1.5,9],fov:48,near:.03,far:180}} gl={{antialias:true,powerPreference:'high-performance'}} fallback={<div className="loading">This experience requires WebGL.</div>}><Suspense fallback={null}><Film {...props} veil={veil} progress={progress}/></Suspense></Canvas><div ref={veil} className="veil"/><Loading/><div className="film-progress"><div ref={progress}/></div></>;
}
useGLTF.preload('/models/spooky_house_halloween.glb',true,true,configureModelLoader);useGLTF.preload('/models/lowpoly_ouija_board_with_props.glb',true,true,configureModelLoader);
