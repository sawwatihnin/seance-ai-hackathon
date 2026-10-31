import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {Box3,BufferGeometry,Color,Group,Mesh,MeshStandardMaterial,Raycaster,Vector3} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {FilmState} from '../timeline/createIntroTimeline';
export const FOREST_URL='/models/a_forest_3_with_a_road_at_night_for_game.glb';
export function ForestEnvironment({film}:{film:FilmState}){
 const gltf=useGLTF(FOREST_URL);const root=useRef<Group>(null);
 const forest=useMemo(()=>{
  const result=new Group();const batches=new Map<string,{material:MeshStandardMaterial;geometries:BufferGeometry[]}>();
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(object=>{
   if(!(object instanceof Mesh))return;
   const source=object.material as MeshStandardMaterial;
   const bounds=new Box3().setFromObject(object);const center=bounds.getCenter(new Vector3());
   // Thin only foreground foliage in the camera/house corridor. Retain the
   // original road and all trees behind the house and along the frame edges.
   if(source.name!=='Material.003' && Math.abs(center.x)<.95 && center.z>-.7)return;
   if(!batches.has(source.uuid)){
    const material=source.clone();
    material.color.multiplyScalar(source.name==='Material.003'?.32:.25);material.color.multiply(new Color(.72,.78,1.0));
    material.roughness=Math.max(.88,material.roughness);material.metalness=0;
    // The supplied foliage is cutout photography. Alpha testing preserves its
    // silhouettes and depth without sorting 1,400 overlapping transparent cards.
    if(material.transparent){material.transparent=false;material.alphaTest=.35;material.depthWrite=true;}
    material.onBeforeCompile=shader=>{
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float forestLuma=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));
      diffuseColor.rgb=mix(vec3(forestLuma),diffuseColor.rgb,0.76);`);
    };
    material.customProgramCacheKey=()=> 'forest-night-desaturation-v1';
    batches.set(source.uuid,{material,geometries:[]});
   }
   const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
   batches.get(source.uuid)!.geometries.push(geometry);
  });
  for(const {material,geometries} of batches.values()){
   const geometry=mergeGeometries(geometries,false);
   if(geometry){const mesh=new Mesh(geometry,material);result.add(mesh);geometries.forEach(g=>g.dispose());}
   else geometries.forEach(g=>result.add(new Mesh(g,material)));
  }
  return result;
 },[gltf.scene]);
 useFrame(()=>{if(root.current)root.current.visible=film.time<10;});
 // The main terrain spans roughly -4.8..4.7 in X/Z; outlying tree
 // cards extend farther left. Fit the terrain, rather than those outliers.
 return <group ref={root} position={[0,-.65,-13]} scale={5.5}><primitive object={forest}/></group>;
}
useGLTF.preload(FOREST_URL);

// Sample the actual road once, then interpolate cheaply during the crawl.
export function useForestGround(){
 const gltf=useGLTF(FOREST_URL);
 return useMemo(()=>{
  gltf.scene.updateMatrixWorld(true);
  const terrain=gltf.scene.getObjectByName('Plane002_Material003_0');
  const ray=new Raycaster();const samples=Array.from({length:33},(_,i)=>{
   const z=-8+i*.5;ray.set(new Vector3(0,10,(z+13)/5.5),new Vector3(0,-1,0));
   const hit=terrain?ray.intersectObject(terrain,false)[0]:undefined;
   return hit?hit.point.y*5.5-.65:0;
  });
  return (z:number)=>{const t=Math.max(0,Math.min(32,(z+8)*2));const i=Math.min(31,Math.floor(t));return samples[i]+(samples[i+1]-samples[i])*(t-i)};
 },[gltf.scene]);
}
