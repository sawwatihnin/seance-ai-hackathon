import {Suspense,useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {AdaptiveDpr,useAnimations,useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,MathUtils,Mesh,Object3D,PerspectiveCamera,SpotLight,Vector3} from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {CHARACTERS,CORRIDOR_LANE,CORRIDOR_URL,TRANSITION_SECONDS,type Workspace} from './config';

type Props={destination:Workspace;onComplete:()=>void;onReady?:()=>void};
export function preloadCorridorAssets(destination?:Workspace){
  useGLTF.preload(CORRIDOR_URL);
  if(destination)useGLTF.preload(CHARACTERS[destination].url);
}
const smooth=(a:number,b:number,value:number)=>{const x=MathUtils.clamp((value-a)/(b-a),0,1);return x*x*(3-2*x);};
function Passage({destination,onComplete,onReady,veil}:{destination:Workspace;onComplete:()=>void;onReady?:()=>void;veil:React.RefObject<HTMLDivElement|null>}){
  const config=CHARACTERS[destination];
  const corridor=useGLTF(CORRIDOR_URL),character=useGLTF(config.url);
  const fitted=useMemo(()=>{
    const room=clone(corridor.scene),actor=clone(character.scene);
    room.updateMatrixWorld(true);actor.rotation.y=config.yaw;actor.updateMatrixWorld(true);
    const roomBox=new Box3().setFromObject(room,true),roomSize=roomBox.getSize(new Vector3());
    const roomScale=3.2/roomSize.y; // Architectural height, independent of scene export units.
    const floor=room.getObjectByName('Material3_6');
    const floorY=floor?new Box3().setFromObject(floor,true).getCenter(new Vector3()).y:CORRIDOR_LANE.floorY;
    let actorBox=new Box3().setFromObject(actor,true);
    const clip=character.animations.find(animation=>animation.name===config.clip);
    if(clip){
      // Frame and ground the authored walking poses, rather than a wider bind pose.
      const envelope=new Box3(),inspector=new AnimationMixer(actor);
      inspector.clipAction(clip).play();
      for(let sample=0;sample<=6;sample++){
        inspector.setTime(Math.min(clip.duration,TRANSITION_SECONDS)*sample/6);
        actor.updateMatrixWorld(true);envelope.union(new Box3().setFromObject(actor,true));
      }
      inspector.stopAllAction();inspector.uncacheRoot(actor);actor.updateMatrixWorld(true);
      actorBox=envelope;
    }
    const actorSize=actorBox.getSize(new Vector3()),actorCenter=actorBox.getCenter(new Vector3());
    const actorScale=3.2*config.heightRatio/actorSize.y;
    actor.traverse(object=>{if(object instanceof Mesh)object.frustumCulled=false;});
    return {room,actor,roomScale,actorScale,height:actorSize.y*actorScale,width:actorSize.x*actorScale,depth:actorSize.z*actorScale,
      roomPosition:[-CORRIDOR_LANE.x*roomScale,-floorY*roomScale,-CORRIDOR_LANE.characterZ*roomScale] as [number,number,number],
      actorPosition:[-actorCenter.x*actorScale,-actorBox.min.y*actorScale,-actorCenter.z*actorScale] as [number,number,number]};
  },[corridor,character,config]);
  const lightTarget=useMemo(()=>{const target=new Object3D();target.position.set(0,fitted.height*.55,0);return target;},[fitted.height]);
  const {actions,mixer}=useAnimations(character.animations,fitted.actor);
  useEffect(()=>{
    if(!config.clip)return;
    const action=actions[config.clip];action?.reset().fadeIn(.15).play();
    return()=>{action?.stop();mixer.stopAllAction();};
  },[actions,mixer,config.clip]);
  const key=useRef<SpotLight>(null),start=useRef<number|null>(null),complete=useRef(false),warmFrame=useRef(false);
  useFrame((state,delta)=>{
    if(start.current===null&&warmFrame.current){start.current=performance.now();onReady?.();}
    warmFrame.current=true;
    const elapsed=start.current===null?0:(performance.now()-start.current)/1000;
    const progress=smooth(0,TRANSITION_SECONDS,elapsed),camera=state.camera as PerspectiveCamera;
    const aspect=state.size.width/state.size.height;
    const halfFov=MathUtils.degToRad(camera.fov/2);
    const fit=Math.max(fitted.height,fitted.width/aspect)/(2*Math.tan(halfFov))/.72+fitted.depth*.4;
    camera.position.set(Math.sin(progress*Math.PI)*fitted.height*.035,fitted.height*.78,fit+fitted.height*(.18-.30*progress));
    camera.lookAt(0,fitted.height*.55,0);
    if(key.current)key.current.intensity=32+smooth(.3,1.2,elapsed)*28;
    if(veil.current)veil.current.style.opacity=String((1-smooth(0,.5,elapsed))+smooth(1.8,TRANSITION_SECONDS,elapsed));
    if(delta>1/24)state.performance.regress();
    if(elapsed>=TRANSITION_SECONDS&&!complete.current){complete.current=true;onComplete();}
  });
  return <>
    <color attach="background" args={['#100b18']}/><fog attach="fog" args={['#161020',4,23]}/>
    <primitive object={lightTarget}/><ambientLight color="#a985d2" intensity={.6}/><hemisphereLight args={['#eee0f3','#21132f',.8]}/>
    <directionalLight color="#fff4e4" intensity={1.15} position={[1,3,4]}/>
    <spotLight ref={key} color="#f2d9ba" position={[-.65,fitted.height*1.5,fitted.height*1.7]} target={lightTarget} intensity={40} angle={.55} penumbra={.85} distance={14}/>
    <pointLight color="#a985d2" position={[.7,fitted.height*.9,-1]} intensity={10} distance={10}/>
    <pointLight color="#9273b5" position={[-.7,2.7,4]} intensity={7} distance={12}/>
    <group dispose={null}><group position={fitted.roomPosition} scale={fitted.roomScale}><primitive object={fitted.room}/></group><group position={fitted.actorPosition} scale={fitted.actorScale}><primitive object={fitted.actor}/></group></group>
    <AdaptiveDpr/>
  </>;
}
function ContextLifecycle({onComplete}:{onComplete:()=>void}){
  const gl=useThree(state=>state.gl);
  useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener('webglcontextlost',onComplete);return()=>canvas.removeEventListener('webglcontextlost',onComplete);},[gl,onComplete]);
  return null;
}
export default function HorrorCorridorTransition(props:Props){
  const veil=useRef<HTMLDivElement>(null);
  return <><Canvas className="corridor-canvas" dpr={[.75,1.25]} camera={{fov:44,near:.03,far:60}} gl={{antialias:false,powerPreference:'high-performance',alpha:false}} performance={{min:.6,max:1,debounce:1000}} fallback={null}><ContextLifecycle onComplete={props.onComplete}/><Suspense fallback={null}><Passage {...props} veil={veil}/></Suspense></Canvas><div className="corridor-veil" ref={veil} aria-hidden="true"/></>;
}
