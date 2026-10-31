import {useFrame,useThree} from '@react-three/fiber';
import {PerspectiveCamera} from 'three';
import {FilmState,mix,smooth} from '../timeline/createIntroTimeline';
export function CinematicCamera({film}:{film:FilmState}){
 const {camera,size}=useThree();
 useFrame(()=>{
  const t=film.time;const mobile=size.width<size.height;const c=camera as PerspectiveCamera;
  if(t<10){
   const crush=smooth(7,9.5,t);const shake=smooth(5,9,t)*.025+(smooth(9.3,9.45,t)-smooth(9.5,9.8,t))*.15;
   c.position.set(Math.sin(t*71)*shake,mix(1.5,.9,crush)+Math.cos(t*83)*shake,mobile?13:9);
   c.lookAt(0,mix(2.5,2,crush),-4+crush*11);c.fov=mobile?53:48;
  }else{
   const p=smooth(10,15,t);c.position.set(mix(2.8,.4,p),mix(4.8,mobile?10:7.8,p),mix(7.5,mobile?7:5.2,p));c.lookAt(0,.25,0);c.fov=46;
  }
  c.updateProjectionMatrix();
 });return null;
}
