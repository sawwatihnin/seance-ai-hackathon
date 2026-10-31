import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {AnimationMixer,Group,PointLight} from 'three';
import {useFittedModel} from './useFittedModel';
import {FilmState} from '../timeline/createIntroTimeline';
export function OuijaScene({film}:{film:FilmState}){
 const model=useFittedModel('/models/lowpoly_ouija_board_with_props.glb',7);
 const root=useRef<Group>(null);const light=useRef<PointLight>(null);
 const mixer=useMemo(()=>new AnimationMixer(model.scene),[model.scene]);
 useEffect(()=>{model.animations.forEach(c=>mixer.clipAction(c).play());return()=>{mixer.stopAllAction();mixer.uncacheRoot(model.scene)}},[mixer,model]);
 useFrame(({clock})=>{
  if(root.current)root.current.visible=film.time>=10;
  // The authored two-track action targets the actual planchette; do not re-parent it.
  mixer.setTime(Math.max(0,film.time-10)*.6);
  const pointer=model.scene.getObjectByName('ouija_board_part');
  // Lift the real planchette just above the board to avoid coplanar overlap.
  if(pointer)pointer.position.y=1.6542208194732666;
  if(light.current)light.current.intensity=18+Math.sin(clock.elapsedTime*11)*1.3+Math.sin(clock.elapsedTime*17)*.6;
 });
 return <group ref={root} visible={false}>
  <group position={model.offset} scale={model.scale}><primitive object={model.scene}/></group>
  <pointLight ref={light} position={[-2,2,1]} color="#ff9a43" intensity={20} distance={15} decay={2}/>
  <pointLight position={[2,1.6,-1]} color="#ffb15b" intensity={13} distance={12}/>
  <spotLight position={[0,7,2]} color="#e5c3a1" intensity={45} angle={.8} penumbra={1}/>
 </group>;
}
