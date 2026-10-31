import type {Workspace} from './config';
export function preloadCorridor(destination?:Workspace) {
  // Importing this module keeps Three.js out of the initial workspace bundle.
  void import('./HorrorCorridorTransition').then(module=>module.preloadCorridorAssets(destination)).catch(()=>{
    // The actual transition owns the visible error/timeout/skip path.
  });
}
