import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {AnimationMixer,Group} from 'three';
import {useForestGround} from './ForestEnvironment';
import {useFittedModel} from './useFittedModel';
import {FilmState,mix,smooth} from '../timeline/createIntroTimeline';
export function SpookyHouse({film}:{film:FilmState}){
 const model=useFittedModel('/models/spooky_house_halloween.glb',7.4,-.1);
 const ground=useForestGround();
 const travel=useRef<Group>(null);const pivot=useRef<Group>(null);
 const mixer=useMemo(()=>new AnimationMixer(model.scene),[model.scene]);
 useEffect(()=>{model.animations.forEach(c=>mixer.clipAction(c).play());return()=>{mixer.stopAllAction();mixer.uncacheRoot(model.scene)}},[mixer,model]);
 useFrame(()=>{
  const t=film.time;if(!travel.current||!pivot.current)return;
  travel.current.visible=t<9.85;
  mixer.setTime(t*.78);
  const crawl=smooth(3,7,t);const leap=smooth(7,8.55,t);const fall=smooth(8.55,9.75,t);
  // The source includes a tiny stray vertex at Y=-.742; visible fingertips
  // contact near Y=-.1. Use that contact plane rather than the outlier.
  // Independent travel and center-of-mass pivot leave all 46 imported bones free.
  const z=mix(-8,2.5,crawl)+leap*2.2+fall*3.5;
  travel.current.position.set(Math.sin(t*3.2)*.065*crawl, ground(z)+mix(0,2.7,leap)-fall*2.7,z);
  pivot.current.rotation.set(-Math.PI/2*smooth(7.25,9.15,t),0,Math.sin(t*3)*.018*crawl*(1-leap));
 });
 return <group ref={travel}><pointLight position={[0,4,5]} color="#a5bfff" intensity={14} distance={9} decay={2}/><pointLight position={[-4,5,-2]} color="#9f79ef" intensity={18} distance={10} decay={2}/><group ref={pivot} position={[0,model.height*.42,0]}><group position={[0,-model.height*.42,0]}><group position={model.offset} scale={model.scale}><primitive object={model.scene}/></group></group></group></group>;
}
