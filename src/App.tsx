import {lazy,Suspense} from 'react';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import Portal from './platform/Portal';
import Workspace from './platform/Workspace';
import './platform/platform.css';
import './platform/midnight.css';
const Cinematic=lazy(()=>import('./Cinematic'));
export default function App(){return <BrowserRouter><Routes><Route path="/" element={<Suspense fallback={<div className="loading">Preparing the séance…</div>}><Cinematic/></Suspense>}/><Route path="/portal" element={<Portal/>}/>{(['community','education','business'] as const).map(section=><Route key={section} path={'/'+section} element={<Workspace key={section} section={section}/>}/>)}<Route path="*" element={<div className="platform panel"><h1>This door is closed.</h1><Link to="/portal">Return to the portal</Link></div>}/></Routes></BrowserRouter>}
