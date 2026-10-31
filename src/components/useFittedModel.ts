import {configureModelLoader} from './modelLoader';
import {useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {Box3,Vector3,Mesh} from 'three';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
export function useFittedModel(url:string,width:number,groundY?:number){
 const gltf=useGLTF(url,true,true,configureModelLoader);
 return useMemo(()=>{
  const scene=clone(gltf.scene);scene.updateMatrixWorld(true);
  const box=new Box3().setFromObject(scene,true);const size=box.getSize(new Vector3());const center=box.getCenter(new Vector3());const scale=width/Math.max(size.x,size.z);
  scene.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
  return {scene,animations:gltf.animations,scale,offset:[-center.x*scale,-(groundY??box.min.y)*scale,-center.z*scale] as [number,number,number],height:(box.max.y-(groundY??box.min.y))*scale,depth:size.z*scale};
 },[gltf,width,groundY]);
}
