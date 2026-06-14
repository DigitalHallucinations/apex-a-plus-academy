import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Activity, Award, BarChart3, Bell, BookOpen, Bookmark, Brain, CalendarDays, Check,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Flame, Gauge, GraduationCap, Home,
  Layers3, Menu, Moon, NotebookPen, Play, Plus, RotateCcw, Search, Settings, ShieldCheck,
  Sparkles, Sun, Target, TimerReset, Trophy, X, Zap
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { domains, flashcards, questions } from "./data";
import type { Attempt, ExamCode, LearnerState, Question, View } from "./types";

const initialState: LearnerState = {
  name: "Future Technician", targetDate: "", dailyGoal: 25, streak: 1, lastStudyDate: "",
  answered: {}, attempts: [], bookmarks: [], notes: [], cardRatings: {}, theme: "dark"
};

const nav: { id: View; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Command Center", icon: Home },
  { id: "learn", label: "Learning Paths", icon: BookOpen },
  { id: "practice", label: "Practice Lab", icon: Target },
  { id: "flashcards", label: "Recall Deck", icon: Layers3 },
  { id: "analytics", label: "Performance", icon: BarChart3 },
  { id: "notes", label: "Notes & Saves", icon: NotebookPen },
  { id: "settings", label: "Preferences", icon: Settings }
];

function isTauri() { return "__TAURI_INTERNALS__" in window; }

async function readState(): Promise<LearnerState> {
  try {
    const saved = isTauri() ? await invoke<Partial<LearnerState>>("load_state") : JSON.parse(localStorage.getItem("apex-state") || "{}");
    return { ...initialState, ...saved };
  } catch { return initialState; }
}

async function writeState(state: LearnerState) {
  if (isTauri()) await invoke("save_state", { state });
  else localStorage.setItem("apex-state", JSON.stringify(state));
}

function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0; }
function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }
function formatTime(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [state, setState] = useState<LearnerState>(initialState);
  const [ready, setReady] = useState(false);
  const [sidebar, setSidebar] = useState(true);

  useEffect(() => { readState().then(s => { setState(s); setReady(true); }); }, []);
  useEffect(() => { if (ready) writeState(state); }, [state, ready]);
  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);

  const update = (next: Partial<LearnerState>) => setState(s => ({ ...s, ...next }));
  const attempts = state.attempts;
  const avg = attempts.length ? Math.round(attempts.reduce((a, x) => a + pct(x.score, x.total), 0) / attempts.length) : 0;

  if (!ready) return <div className="splash"><div className="brand-mark"><Zap /></div><h1>Apex A+ Academy</h1><p>Preparing your workspace...</p></div>;

  return <div className={`app ${sidebar ? "" : "collapsed"}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap /></div><div><b>APEX</b><span>A+ ACADEMY</span></div></div>
      <button className="collapse" onClick={() => setSidebar(!sidebar)}>{sidebar ? <ChevronLeft /> : <ChevronRight />}</button>
      <nav>{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} title={item.label}><item.icon/><span>{item.label}</span></button>)}</nav>
      <div className="sidebar-card">
        <div className="mini-ring" style={{ "--value": `${avg}%` } as React.CSSProperties}><span>{avg}%</span></div>
        <div><b>Readiness</b><small>{attempts.length ? "Keep building" : "Take a baseline"}</small></div>
      </div>
      <div className="sidebar-foot"><ShieldCheck/><span>Private & offline</span></div>
    </aside>

    <main>
      <header>
        <button className="icon-btn mobile-menu" onClick={() => setSidebar(!sidebar)}><Menu/></button>
        <div className="search"><Search/><input placeholder="Search objectives, commands, ports..." onFocus={() => setView("learn")}/><kbd>Ctrl K</kbd></div>
        <button className="icon-btn"><Bell/></button>
        <button className="profile" onClick={() => setView("settings")}><span>{state.name.slice(0,2).toUpperCase()}</span><div><b>{state.name}</b><small>Exam candidate</small></div></button>
      </header>

      <section className="content">
        {view === "dashboard" && <Dashboard state={state} setView={setView} />}
        {view === "learn" && <Learn state={state} setState={setState} setView={setView} />}
        {view === "practice" && <Practice state={state} setState={setState} />}
        {view === "flashcards" && <Flashcards state={state} setState={setState} />}
        {view === "analytics" && <Analytics state={state} />}
        {view === "notes" && <Notes state={state} setState={setState} />}
        {view === "settings" && <Preferences state={state} update={update} />}
      </section>
    </main>
  </div>;
}

function Dashboard({ state, setView }: { state: LearnerState; setView: (v: View) => void }) {
  const attempted = Object.keys(state.answered).length;
  const correct = Object.values(state.answered).filter(x => x.correct > 0).length;
  const avg = state.attempts.length ? Math.round(state.attempts.reduce((a, x) => a + pct(x.score, x.total), 0) / state.attempts.length) : 0;
  const trend = state.attempts.slice(-7).map((a, i) => ({ name: `Test ${i + 1}`, score: pct(a.score, a.total) }));
  const days = state.targetDate ? Math.max(0, Math.ceil((new Date(state.targetDate).getTime() - Date.now()) / 86400000)) : null;
  const domainData = domains.map(d => {
    const qs = questions.filter(q => q.domain === d.id);
    const tries = qs.reduce((sum, q) => sum + (state.answered[q.id]?.attempts || 0), 0);
    const hits = qs.reduce((sum, q) => sum + (state.answered[q.id]?.correct || 0), 0);
    return { ...d, mastery: tries ? pct(hits, tries) : 0 };
  });
  const nextDomain = [...domainData].sort((a,b) => a.mastery - b.mastery)[0];

  return <>
    <div className="page-title"><div><span className="eyebrow">YOUR STUDY COMMAND CENTER</span><h1>Ready to level up, {state.name.split(" ")[0]}?</h1><p>Build real troubleshooting instincts, one focused session at a time.</p></div><div className="date-pill"><CalendarDays/><span>{days === null ? "Set an exam date" : `${days} days to exam`}</span></div></div>
    <div className="hero-grid">
      <div className="hero-card glow-card">
        <div className="hero-copy"><span className="pill teal"><Sparkles/> SMART RECOMMENDATION</span><h2>Strengthen {nextDomain.name}</h2><p>Your current activity suggests this is the best place to earn the next chunk of exam readiness.</p><button className="primary" onClick={() => setView("practice")}><Play/> Start focused drill</button></div>
        <div className="hero-visual"><div className="orb"><Brain/><span>{nextDomain.mastery}%</span><small>mastery</small></div></div>
      </div>
      <div className="goal-card panel"><div className="panel-heading"><span>DAILY MISSION</span><Flame/></div><div className="goal-number"><b>{Math.min(attempted, state.dailyGoal)}</b><span>/ {state.dailyGoal} questions</span></div><div className="progress"><i style={{width:`${Math.min(100,pct(attempted,state.dailyGoal))}%`}}/></div><div className="streak"><Flame/><b>{state.streak} day streak</b><span>Consistency compounds.</span></div></div>
    </div>
    <div className="stats-grid">
      <Stat icon={Gauge} label="Overall readiness" value={`${avg}%`} sub={state.attempts.length ? `${state.attempts.length} exams completed` : "Baseline not taken"} color="blue"/>
      <Stat icon={CircleHelp} label="Questions explored" value={`${attempted}`} sub={`${correct} currently mastered`} color="purple"/>
      <Stat icon={Layers3} label="Cards due" value={`${flashcards.filter(f => !state.cardRatings[f.id] || state.cardRatings[f.id].due <= new Date().toISOString()).length}`} sub="Spaced recall queue" color="amber"/>
      <Stat icon={Trophy} label="Best score" value={`${Math.max(0,...state.attempts.map(a => pct(a.score,a.total)))}%`} sub="Personal record" color="teal"/>
    </div>
    <div className="two-col">
      <div className="panel chart-panel"><div className="panel-title"><div><span>PERFORMANCE TREND</span><h3>Practice exam scores</h3></div><button className="text-btn" onClick={() => setView("analytics")}>Full report <ChevronRight/></button></div>{trend.length ? <ResponsiveContainer width="100%" height={230}><AreaChart data={trend}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#55a8ff" stopOpacity={.45}/><stop offset="95%" stopColor="#55a8ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area type="monotone" dataKey="score" stroke="#55a8ff" strokeWidth={3} fill="url(#scoreFill)"/></AreaChart></ResponsiveContainer> : <Empty message="Complete a practice session to reveal your trend." action="Start practice" onClick={() => setView("practice")}/>}</div>
      <div className="panel"><div className="panel-title"><div><span>DOMAIN MASTERY</span><h3>Objective coverage</h3></div></div><div className="domain-list">{domainData.slice(0,5).map(d => <div className="domain-row" key={d.id}><span className="domain-dot" style={{background:d.color}}/><div><b>{d.name}</b><small>{d.exam}</small></div><div className="thin-progress"><i style={{width:`${d.mastery}%`,background:d.color}}/></div><strong>{d.mastery}%</strong></div>)}</div></div>
    </div>
    <div className="disclaimer">Apex A+ Academy is an independent study tool. CompTIA and A+ are trademarks of CompTIA, Inc. This product is not affiliated with or endorsed by CompTIA.</div>
  </>;
}

function Stat({ icon: Icon, label, value, sub, color }: { icon: typeof Gauge; label:string; value:string; sub:string; color:string }) {
  return <div className="stat-card panel"><div className={`stat-icon ${color}`}><Icon/></div><div><span>{label}</span><b>{value}</b><small>{sub}</small></div></div>;
}

function Learn({ state, setState, setView }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>>; setView:(v:View)=>void }) {
  const [exam, setExam] = useState<ExamCode>("220-1201");
  const [selected, setSelected] = useState(domains[0].id);
  const list = domains.filter(d => d.exam === exam);
  const active = domains.find(d => d.id === selected && d.exam === exam) || list[0];
  const activeQuestions = questions.filter(q => q.domain === active.id);
  return <>
    <PageHead eyebrow="STRUCTURED CURRICULUM" title="Learning paths" subtitle="Move objective by objective. Every lesson connects concepts to technician decisions."/>
    <div className="segmented"><button className={exam==="220-1201"?"active":""} onClick={()=>{setExam("220-1201");setSelected("mobile")}}>Core 1 · 220-1201</button><button className={exam==="220-1202"?"active":""} onClick={()=>{setExam("220-1202");setSelected("os")}}>Core 2 · 220-1202</button></div>
    <div className="learn-layout"><div className="domain-nav panel">{list.map((d,i) => { const qs=questions.filter(q=>q.domain===d.id); const done=qs.filter(q=>state.answered[q.id]?.correct).length; return <button key={d.id} className={active.id===d.id?"active":""} onClick={()=>setSelected(d.id)}><span className="domain-index" style={{color:d.color}}>{String(i+1).padStart(2,"0")}</span><div><b>{d.name}</b><small>{d.weight}% of exam · {done}/{qs.length} checked</small></div><ChevronRight/></button>})}</div>
      <div className="lesson panel"><div className="lesson-hero" style={{"--accent":active.color} as React.CSSProperties}><span>{active.exam} DOMAIN</span><h2>{active.name}</h2><p>{active.description}</p><div className="lesson-meta"><span><Target/> {active.weight}% exam weight</span><span><Clock3/> 30-45 min path</span></div></div><h3>What you'll master</h3><div className="topic-grid">{active.topics.map((t,i)=><div key={t}><span>{i+1}</span><div><b>{t}</b><small>Concepts, scenarios, and field notes</small></div><Check/></div>)}</div><h3>Knowledge checks</h3><div className="check-list">{activeQuestions.map(q=><div key={q.id}><div className={`status ${state.answered[q.id]?.correct ? "done":""}`}>{state.answered[q.id]?.correct?<Check/>:<CircleHelp/>}</div><div><b>{q.objective}</b><small>{q.difficulty} · Original practice scenario</small></div><button className="ghost" onClick={()=>{setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks:s.bookmarks.concat(q.id)}));setView("practice")}}><Bookmark/></button></div>)}</div><button className="primary wide" onClick={()=>setView("practice")}><Play/> Practice this domain</button></div>
    </div>
  </>;
}

function Practice({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const [mode, setMode] = useState<"setup"|"active"|"results">("setup");
  const [exam, setExam] = useState<ExamCode|"Mixed">("220-1201");
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string,number>>({});
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(()=>{ if(mode!=="active") return; const t=setInterval(()=>setElapsed(x=>x+1),1000); return ()=>clearInterval(t); },[mode]);
  const start = () => { const pool=exam==="Mixed"?questions:questions.filter(q=>q.exam===exam); setSession(shuffle(pool).slice(0,Math.min(count,pool.length)));setIndex(0);setAnswers({});setElapsed(0);setRevealed(false);setMode("active"); };
  const finish = () => {
    const score=session.filter(q=>answers[q.id]===q.answer).length;
    const ds:Attempt["domainScores"]={}; session.forEach(q=>{ds[q.domain] ||= {correct:0,total:0};ds[q.domain].total++;if(answers[q.id]===q.answer)ds[q.domain].correct++;});
    const attempt:Attempt={id:crypto.randomUUID(),date:new Date().toISOString(),exam,score,total:session.length,durationSec:elapsed,domainScores:ds};
    setState(s=>{const answered={...s.answered};session.forEach(q=>{const old=answered[q.id]||{correct:0,attempts:0};answered[q.id]={correct:old.correct+(answers[q.id]===q.answer?1:0),attempts:old.attempts+1};});return {...s,answered,attempts:[...s.attempts,attempt]};});setMode("results");
  };
  if(mode==="setup") return <><PageHead eyebrow="ADAPTIVE PRACTICE" title="Practice lab" subtitle="Choose a target, enter focus mode, and learn from every explanation."/><div className="setup-grid"><div className="panel setup-main"><h3>Build your session</h3><label>Exam track</label><div className="option-grid">{(["220-1201","220-1202","Mixed"] as const).map(x=><button key={x} className={exam===x?"selected":""} onClick={()=>setExam(x)}><span>{x==="Mixed"?<Brain/>:x==="220-1201"?<Activity/>:<ShieldCheck/>}</span><b>{x}</b><small>{x==="Mixed"?"Both cores":"Focused objective mix"}</small></button>)}</div><label>Question count</label><div className="count-picker">{[5,10,15,20].map(x=><button key={x} className={count===x?"selected":""} onClick={()=>setCount(x)}>{x}</button>)}</div><button className="primary wide launch" onClick={start}><Play/> Launch session</button></div><div className="panel setup-side"><span className="pill purple"><Sparkles/> SESSION PREVIEW</span><h2>{Math.min(count,exam==="Mixed"?questions.length:questions.filter(q=>q.exam===exam).length)} questions</h2><div className="preview-row"><Clock3/><div><b>Estimated time</b><small>{Math.min(count,20)*1.5} minutes</small></div></div><div className="preview-row"><Target/><div><b>Coverage</b><small>{exam === "Mixed" ? "All Core 1 & Core 2 domains" : `Weighted ${exam} mix`}</small></div></div><div className="preview-row"><CircleHelp/><div><b>Learning mode</b><small>Explanations available after answering</small></div></div></div></div></>;
  if(mode==="results") { const score=session.filter(q=>answers[q.id]===q.answer).length; return <><PageHead eyebrow="SESSION COMPLETE" title="Your results" subtitle="Review what clicked and turn misses into your next study plan."/><div className="results panel"><div className={`result-ring ${pct(score,session.length)>=75?"pass":""}`}><b>{pct(score,session.length)}%</b><span>{score} of {session.length}</span></div><h2>{pct(score,session.length)>=75?"Strong work.":"Good baseline. Keep sharpening."}</h2><p>{pct(score,session.length)>=75?"Your decisions are trending toward exam readiness.":"Review the explanations below, then run a focused domain drill."}</p><div className="result-actions"><button className="primary" onClick={()=>setMode("setup")}><RotateCcw/> New session</button></div></div><div className="review-list">{session.map((q,i)=>{const ok=answers[q.id]===q.answer;return <div className={`panel review ${ok?"correct":"wrong"}`} key={q.id}><span>{ok?<Check/>:<X/>}</span><div><small>QUESTION {i+1} · {q.objective}</small><b>{q.prompt}</b><p><strong>Your answer:</strong> {q.options[answers[q.id]] || "Unanswered"}</p>{!ok&&<p><strong>Correct:</strong> {q.options[q.answer]}</p>}<em>{q.explanation}</em></div></div>})}</div></>; }
  const q=session[index]; const selected=answers[q.id]; const isLast=index===session.length-1;
  return <div className="exam-shell"><div className="exam-top"><button className="ghost" onClick={()=>setMode("setup")}><X/> Exit</button><div><span>QUESTION {index+1} OF {session.length}</span><div className="exam-progress"><i style={{width:`${pct(index+1,session.length)}%`}}/></div></div><div className="timer"><Clock3/>{formatTime(elapsed)}</div></div><div className="question-card panel"><div className="question-meta"><span>{q.exam}</span><span>{domains.find(d=>d.id===q.domain)?.name}</span><span>{q.difficulty}</span><button className={state.bookmarks.includes(q.id)?"saved":""} onClick={()=>setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks.filter(x=>x!==q.id):[...s.bookmarks,q.id]}))}><Bookmark/></button></div><h2>{q.prompt}</h2><div className="answers">{q.options.map((opt,i)=>{const cls=revealed?(i===q.answer?"correct":selected===i?"wrong":""):selected===i?"selected":"";return <button key={opt} className={cls} disabled={revealed} onClick={()=>setAnswers(a=>({...a,[q.id]:i}))}><span>{String.fromCharCode(65+i)}</span><b>{opt}</b>{revealed&&i===q.answer&&<Check/>}{revealed&&selected===i&&i!==q.answer&&<X/>}</button>})}</div>{revealed&&<div className="explanation"><Sparkles/><div><b>{selected===q.answer?"Exactly right":"Key takeaway"}</b><p>{q.explanation}</p><small>OBJECTIVE · {q.objective}</small></div></div>}<div className="question-actions"><button className="ghost" disabled={index===0} onClick={()=>{setIndex(i=>i-1);setRevealed(false)}}><ChevronLeft/> Previous</button>{!revealed?<button className="primary" disabled={selected===undefined} onClick={()=>setRevealed(true)}>Check answer</button>:<button className="primary" onClick={()=>{if(isLast)finish();else{setIndex(i=>i+1);setRevealed(false)}}}>{isLast?"Finish session":"Next question"}<ChevronRight/></button>}</div></div></div>;
}

function Flashcards({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const due=flashcards.filter(f=>!state.cardRatings[f.id]||state.cardRatings[f.id].due<=new Date().toISOString());
  const deck=due.length?due:flashcards; const [index,setIndex]=useState(0); const [flipped,setFlipped]=useState(false); const card=deck[index%deck.length];
  const rate=(ease:number)=>{const prev=state.cardRatings[card.id]||{ease:2.5,interval:0,due:""};const interval=ease===1?1:Math.max(1,Math.round((prev.interval||1)*(ease===2?1.5:ease===3?2.5:4)));const dueDate=new Date(Date.now()+interval*86400000).toISOString();setState(s=>({...s,cardRatings:{...s.cardRatings,[card.id]:{ease,interval,due:dueDate}}}));setIndex(i=>i+1);setFlipped(false);};
  return <><PageHead eyebrow="SPACED REPETITION" title="Recall deck" subtitle="Actively retrieve the answer, then rate your recall honestly."/><div className="deck-status"><div><b>{due.length}</b><span>due now</span></div><div><b>{Object.keys(state.cardRatings).length}</b><span>in rotation</span></div><div><b>{flashcards.length}</b><span>total cards</span></div></div><div className="flash-wrap"><div className={`flashcard ${flipped?"flipped":""}`} onClick={()=>setFlipped(!flipped)}><div className="flash-face front"><span>{domains.find(d=>d.id===card.domain)?.name}</span><Brain/><h2>{card.front}</h2><small>Click card to reveal</small></div><div className="flash-face back"><span>ANSWER</span><Sparkles/><p>{card.back}</p><small>How well did you recall it?</small></div></div>{flipped?<div className="rating"><button onClick={()=>rate(1)}><span>Again</span><small>1 day</small></button><button onClick={()=>rate(2)}><span>Hard</span><small>Short interval</small></button><button onClick={()=>rate(3)}><span>Good</span><small>Growing interval</small></button><button onClick={()=>rate(4)}><span>Easy</span><small>Long interval</small></button></div>:<button className="primary" onClick={()=>setFlipped(true)}>Reveal answer</button>}<div className="deck-nav"><button onClick={()=>{setIndex(i=>Math.max(0,i-1));setFlipped(false)}}><ChevronLeft/></button><span>{index%deck.length+1} / {deck.length}</span><button onClick={()=>{setIndex(i=>i+1);setFlipped(false)}}><ChevronRight/></button></div></div></>;
}

function Analytics({ state }: { state:LearnerState }) {
  const rows=domains.map(d=>{let correct=0,total=0;questions.filter(q=>q.domain===d.id).forEach(q=>{correct+=state.answered[q.id]?.correct||0;total+=state.answered[q.id]?.attempts||0});return {name:d.name.split(" ")[0],full:d.name,score:pct(correct,total),color:d.color,total};});
  const history=state.attempts.slice(-10).map((a,i)=>({name:`#${i+1}`,score:pct(a.score,a.total)}));
  return <><PageHead eyebrow="INSIGHT ENGINE" title="Performance analytics" subtitle="See the pattern behind your scores and put study time where it matters."/><div className="analytics-grid"><div className="panel"><div className="panel-title"><div><span>DOMAIN ACCURACY</span><h3>Mastery by objective</h3></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={rows} layout="vertical" margin={{left:15}}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis type="number" domain={[0,100]} stroke="var(--muted)"/><YAxis dataKey="name" type="category" width={80} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Bar dataKey="score" radius={[0,6,6,0]}>{rows.map(r=><Cell key={r.full} fill={r.color}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="panel readiness-card"><span>READINESS SIGNAL</span><div className="big-score">{state.attempts.length?Math.round(state.attempts.reduce((x,a)=>x+pct(a.score,a.total),0)/state.attempts.length):0}<sup>%</sup></div><p>Based on completed practice sessions. Aim for consistent 85%+ results across every domain.</p><div className="readiness-bands"><i/><i/><i/><i/></div><small>Building foundation · Developing · Ready · Strong</small></div></div><div className="panel chart-panel"><div className="panel-title"><div><span>RECENT SESSIONS</span><h3>Score trajectory</h3></div></div>{history.length?<ResponsiveContainer width="100%" height={260}><AreaChart data={history}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area dataKey="score" stroke="#36d6b5" fill="#36d6b533" strokeWidth={3}/></AreaChart></ResponsiveContainer>:<Empty message="Your score history will appear after your first session."/>}</div><div className="history-list panel"><div className="panel-title"><div><span>ATTEMPT LOG</span><h3>Recent activity</h3></div></div>{state.attempts.length?state.attempts.slice().reverse().map(a=><div key={a.id}><span className={pct(a.score,a.total)>=75?"pass":""}>{pct(a.score,a.total)}%</span><div><b>{a.exam} practice</b><small>{new Date(a.date).toLocaleDateString()} · {a.score}/{a.total} correct</small></div><strong>{formatTime(a.durationSec)}</strong></div>):<Empty message="No attempts recorded yet."/>}</div></>;
}

function Notes({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const [active,setActive]=useState(state.notes[0]?.id||""); const [title,setTitle]=useState(""); const [body,setBody]=useState("");
  const open=(id:string)=>{const n=state.notes.find(x=>x.id===id);if(n){setActive(id);setTitle(n.title);setBody(n.body)}};
  const create=()=>{const id=crypto.randomUUID();const note={id,title:"New study note",body:"",updatedAt:new Date().toISOString()};setState(s=>({...s,notes:[note,...s.notes]}));setActive(id);setTitle(note.title);setBody("");};
  const save=()=>{if(!active)return;setState(s=>({...s,notes:s.notes.map(n=>n.id===active?{...n,title,body,updatedAt:new Date().toISOString()}:n)}));};
  const savedQs=questions.filter(q=>state.bookmarks.includes(q.id));
  return <><PageHead eyebrow="PERSONAL KNOWLEDGE BASE" title="Notes & saves" subtitle="Capture the details you tend to forget and keep difficult questions close."/><div className="notes-layout"><div className="panel notes-list"><div className="notes-head"><h3>Study notes</h3><button onClick={create}><Plus/></button></div>{state.notes.map(n=><button className={active===n.id?"active":""} key={n.id} onClick={()=>open(n.id)}><NotebookPen/><div><b>{n.title}</b><small>{new Date(n.updatedAt).toLocaleDateString()}</small></div></button>)}{!state.notes.length&&<Empty message="Create your first note."/>}<h3 className="saved-heading">Saved questions</h3>{savedQs.map(q=><div className="saved-question" key={q.id}><Bookmark/><div><b>{q.objective}</b><small>{q.exam}</small></div></div>)}</div><div className="panel editor">{active?<><input value={title} onChange={e=>setTitle(e.target.value)} onBlur={save}/><textarea value={body} onChange={e=>setBody(e.target.value)} onBlur={save} placeholder="Write commands, mnemonics, troubleshooting steps, or explanations in your own words..."/><div className="editor-foot"><span>Saved automatically when you leave a field</span><button className="primary" onClick={save}><Check/> Save now</button></div></>:<Empty message="Select a note or create a new one to begin." action="New note" onClick={create}/>}</div></div></>;
}

function Preferences({ state, update }: { state:LearnerState; update:(n:Partial<LearnerState>)=>void }) {
  return <><PageHead eyebrow="MAKE IT YOURS" title="Preferences" subtitle="Tune your study target, daily rhythm, and workspace."/><div className="settings-grid"><div className="panel settings-card"><div className="setting-icon"><GraduationCap/></div><div><h3>Learner profile</h3><p>This name appears throughout your workspace.</p><label>Display name<input value={state.name} onChange={e=>update({name:e.target.value})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><CalendarDays/></div><div><h3>Exam target</h3><p>Set a date to add a countdown to your dashboard.</p><label>Target date<input type="date" value={state.targetDate} onChange={e=>update({targetDate:e.target.value})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Target/></div><div><h3>Daily mission</h3><p>Choose a realistic question goal you can sustain.</p><label>Questions per day<input type="number" min="5" max="100" value={state.dailyGoal} onChange={e=>update({dailyGoal:Number(e.target.value)})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Moon/></div><div><h3>Appearance</h3><p>Switch the complete interface theme.</p><div className="theme-toggle"><button className={state.theme==="dark"?"active":""} onClick={()=>update({theme:"dark"})}><Moon/> Dark</button><button className={state.theme==="light"?"active":""} onClick={()=>update({theme:"light"})}><Sun/> Light</button></div></div></div><div className="panel about-card"><div className="brand-mark"><Zap/></div><div><h3>Apex A+ Academy</h3><p>Version 1.0.0 · Offline-first desktop edition</p><small>Your progress is stored locally on this computer. This independent educational app is not affiliated with or endorsed by CompTIA.</small></div></div></div></>;
}

function PageHead({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></div>; }
function Empty({message,action,onClick}:{message:string;action?:string;onClick?:()=>void}) { return <div className="empty"><Brain/><p>{message}</p>{action&&<button className="ghost" onClick={onClick}>{action}</button>}</div>; }
