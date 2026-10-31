import {useEffect,useRef,useState,type FormEvent,type KeyboardEvent,type ReactNode} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import Markdown from 'react-markdown';
import {api} from './types';
import './chat.css';
type Member={id:string;name:string;online?:boolean};
type Message={seq:number;role:'user'|'assistant'|'system';authorId?:string;author:string;text:string;failed?:boolean};
type Fact={id:string;text:string;by:string};
type Session={workspace:string;inviteRequired:boolean;member:Member|null};
type View={workspace:string;invite:string;you:Member;members:Member[];facts:Fact[];messages:Message[];thinking:string[];lastSeq:number};
const suggestions=['Help us organize a food drive near Raleigh.','Our budget is $500 and we need volunteers by Friday.','What has the team decided so far?'];
function Bar({children}:{children?:ReactNode}){return <header className="chat-bar"><h1>Seance.AI <span aria-hidden="true">✦</span></h1>{children}<Link to="/portal">↖ portal</Link></header>}
function Join({session,code,onJoin}:{session:Session;code:string;onJoin:(member:Member)=>void}){const [name,setName]=useState(''),[invite,setInvite]=useState(code),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');try{onJoin(await api<Member>('/join',{method:'POST',body:JSON.stringify({name,code:invite})}))}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <form className="chat-join" onSubmit={submit}><h2>Join the séance</h2><p>One shared AI. Everyone sees the same conversation, and it remembers what the whole team says.</p><label htmlFor="join-name">Your name</label><input id="join-name" autoFocus required maxLength={40} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/>{session.inviteRequired&&<><label htmlFor="join-code">Invite code</label><input id="join-code" required autoComplete="off" value={invite} onChange={e=>setInvite(e.target.value)}/></>}{error&&<p className="chat-error" role="alert">{error}</p>}<button disabled={busy}>{busy?'Joining…':'Enter workspace'}</button></form>}
function Invite({code}:{code:string}){const [copied,setCopied]=useState(false),link=`${location.origin}/community?invite=${encodeURIComponent(code)}`;if(!code)return <p className="chat-muted">Local mode: set INVITE_CODE to invite people.</p>;
 async function copy(){try{await navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}}
 return <><button className="chat-invite" onClick={copy}>{copied?'Link copied':'Copy invite link'}</button><p className="chat-muted">Code: <code>{code}</code></p></>}
function Bubble({message,mine}:{message:Message;mine:boolean}){if(message.role==='system')return <li className="chat-event">{message.text}</li>;return <li className={`chat-message ${message.role} ${mine?'mine':''} ${message.failed?'failed':''}`}><span className="chat-author">{mine?'You':message.author}</span><div className="chat-text"><Markdown components={{a:({href,children})=><a href={href} target="_blank" rel="noreferrer">{children}</a>}}>{message.text}</Markdown></div></li>}
function Room({onSignedOut}:{onSignedOut:()=>void}){const [view,setView]=useState<View>(),[messages,setMessages]=useState<Message[]>([]),[text,setText]=useState(''),[error,setError]=useState(''),[panel,setPanel]=useState(false),after=useRef(0),list=useRef<HTMLOListElement>(null);
 useEffect(()=>{let active=true;const refresh=()=>api<View>('/workspace?after='+after.current).then(next=>{if(!active)return;setError('');setView(next);if(next.messages.length){after.current=next.lastSeq;setMessages(current=>[...current,...next.messages.filter(m=>!current.some(c=>c.seq===m.seq))]);}}).catch(e=>{if(!active)return;if((e as Error).message==='Join the workspace first')onSignedOut();else setError('Reconnecting…');});void refresh();const timer=setInterval(refresh,1500);return()=>{active=false;clearInterval(timer)}},[onSignedOut]);
 useEffect(()=>{const element=list.current;if(element)element.scrollTop=element.scrollHeight},[messages.length,view?.thinking.length]);
 async function send(value=text){const message=value.trim();if(!message)return;setText('');setError('');try{await api('/messages',{method:'POST',body:JSON.stringify({text:message})})}catch(e){setText(message);setError((e as Error).message)}}
 const keydown=(event:KeyboardEvent<HTMLTextAreaElement>)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void send();}};
 const waiting=view?.thinking.includes(view.you.name)??false,talk=messages.some(m=>m.role!=='system');
 return <>
  <Bar><button className="chat-panel-toggle" aria-expanded={panel} onClick={()=>setPanel(open=>!open)}>Shared context ({view?.facts.length??0})</button></Bar>
  <div className="chat-layout">
   <aside className={panel?'chat-side open':'chat-side'} aria-label="Workspace">
    <section><h2>{view?.workspace??'Workspace'}</h2><Invite code={view?.invite??''}/></section>
    <section><h3>In this workspace</h3><ul className="chat-people">{view?.members.map(m=><li key={m.id}><span className={m.online?'dot on':'dot'} aria-hidden="true"/>{m.name}{m.id===view.you.id?' (you)':''}<span className="sr-only">{m.online?' online':' offline'}</span></li>)}</ul></section>
    <section className="chat-context"><h3>Shared context</h3>{view?.facts.length?<ul>{view.facts.map(f=><li key={f.id}>{f.text}<small>from {f.by}</small></li>)}</ul>:<p className="chat-muted">Decisions, budgets, and deadlines appear here for everyone as the team shares them.</p>}</section>
    <Link className="chat-workflows" to="/community/workflows">Agent workflows ↗</Link>
   </aside>
   <main className="chat-main">
    <ol className="chat-messages" ref={list} aria-live="polite">{!talk&&<li className="chat-empty"><span aria-hidden="true">✦</span><h2>What should we make happen?</h2><p>Everyone here shares this conversation, and Seance remembers it for the whole team.</p><div>{suggestions.map(s=><button key={s} onClick={()=>void send(s)}>{s}</button>)}</div></li>}{messages.map(m=><Bubble key={m.seq} message={m} mine={m.authorId===view?.you.id}/>)}{view?.thinking.length?<li className="chat-thinking" role="status">Seance is answering {view.thinking.join(', ')}…</li>:null}</ol>
    {error&&<p className="chat-error" role="alert">{error}</p>}
    <form className="chat-composer" onSubmit={event=>{event.preventDefault();void send();}}><textarea aria-label="Message the shared workspace" rows={1} maxLength={4000} placeholder="Message the whole workspace" value={text} onChange={e=>setText(e.target.value)} onKeyDown={keydown}/><button aria-label="Send message" disabled={!text.trim()||waiting}>↑</button></form>
   </main>
  </div>
 </>}
export default function Chat(){const [params,setParams]=useState(()=>new URLSearchParams(location.search)),[,setSearch]=useSearchParams(),[session,setSession]=useState<Session>(),[error,setError]=useState('');
 useEffect(()=>{api<Session>('/session').then(setSession).catch(()=>setError('The workspace is unavailable. Start the server and reload.'))},[]);
 const signedOut=useRef(()=>setSession(current=>current&&{...current,member:null})).current;
 const joined=(member:Member)=>{setSession(current=>current&&{...current,member});setSearch({},{replace:true});setParams(new URLSearchParams());};
 return <div className="seance-chat"><div className="chat-fog" aria-hidden="true"><i/><i/></div>{session?.member?<Room onSignedOut={signedOut}/>:<><Bar/>{session?<Join session={session} code={params.get('invite')??''} onJoin={joined}/>:<p className={error?'chat-error chat-loading':'chat-loading'} role={error?'alert':'status'}>{error||'Opening the workspace…'}</p>}</>}</div>}
