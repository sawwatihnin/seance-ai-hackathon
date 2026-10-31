import {Sparkles} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {useRef} from 'react';
import {DirectionalLight,FogExp2,Mesh} from 'three';
import {FilmState,mix,smooth} from '../timeline/createIntroTimeline';
export function Atmosphere({film}:{film:FilmState}){
 const floor=useRef<Mesh>(null);
 const moon=useRef<DirectionalLight>(null);const fog=useRef<FogExp2>(null);
 useFrame(()=>{const p=smooth(10,12,film.time);if(floor.current)floor.current.visible=film.time>=10;if(moon.current)moon.current.intensity=mix(3.5,.65,p);if(fog.current)fog.current.density=mix(.046,.016,p)});
 return <>
  <color attach="background" args={['#090610']}/><fogExp2 ref={fog} attach="fog" args={['#160b26',.046]}/>
  <ambientLight intensity={.65} color="#817ca8"/>
  <directionalLight ref={moon} position={[-5,9,4]} color="#8bb8ff" intensity={3.5}/>
  <directionalLight position={[5,5,-8]} color="#b269ed" intensity={2.5}/>
  <pointLight position={[0,2,-4]} intensity={4.5} color="#ff9f46" distance={12}/>
  <Sparkles count={90} scale={[22,9,25]} position={[0,3,-3]} size={1.7} speed={.18} opacity={.35} color="#c7afdf"/>
  <mesh ref={floor} rotation={[-Math.PI/2,0,0]} position={[0,-.045,-5]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#0d0914" roughness={.91}/></mesh>
 </>;
}
