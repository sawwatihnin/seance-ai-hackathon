import type {GLTFLoader} from 'three-stdlib';
// This asset uses the retired specular/glossiness extension. Its specular is
// zero and glossiness is zero, so diffuse + metallic=0 + roughness=1 is exact.
// Adapt the loader JSON in memory; never alter the source GLB or texture.
export function configureModelLoader(loader:GLTFLoader){
 loader.register(parser=>({name:'HalloweenLegacyMaterial',beforeRoot(){
  for(const material of parser.json.materials??[]){
   const legacy=material.extensions?.KHR_materials_pbrSpecularGlossiness;
   if(!legacy)continue;
   material.pbrMetallicRoughness={baseColorFactor:legacy.diffuseFactor??[1,1,1,1],baseColorTexture:legacy.diffuseTexture,metallicFactor:0,roughnessFactor:1-(legacy.glossinessFactor??1)};
   delete material.extensions.KHR_materials_pbrSpecularGlossiness;
  }
  return null;
 }}));
}
