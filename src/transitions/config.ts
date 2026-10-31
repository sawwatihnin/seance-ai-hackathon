export type Workspace = 'community' | 'education' | 'business';
export const CORRIDOR_URL = '/models/corridor.glb';
export const CHARACTERS = {
  community: {url:'/models/nurse_of_horror.glb',name:'Nurse of Horror',heightRatio:.58,yaw:0,clip:null},
  education: {url:'/models/creeping_flesh_creature__free_3d_horror_model.glb',name:'Creeping Flesh Creature',heightRatio:.55,yaw:0,clip:null},
  business: {url:'/models/creepy_scarecrow__horror_stylized.glb',name:'Creepy Scarecrow',heightRatio:.60,yaw:0,clip:'Armature|Unsteady_Walk|baselayer'},
} as const;
export const TRANSITION_SECONDS = 2.5;
export const LOAD_TIMEOUT_MS = 10000;
// Source-space lane measured by floor and horizontal raycasts, not the scene's
// overall center (which falls inside the adjoining rooms). See CORRIDOR_NOTES.md.
export const CORRIDOR_LANE = {x:-263.3,characterZ:-60,floorY:90.93283};
