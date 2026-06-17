import { Brain } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useContent } from "./ContentContext";
import { domainMastery, formatTime, isCertAvailable, objectiveStats, pct, sortCertifications } from "./logic";
import type { LearnerState } from "./types";

export default function Analytics({ state }: { state:LearnerState }) {
  const { certifications, domains, questions } = useContent();
  const cert = state.activeCertId;
  const certDomains = domains.filter(d => d.certId === cert);
  const certQuestions = questions.filter(q => q.certId === cert);
  const certAttempts = state.attempts.filter(a => a.certId === cert);

  const rows=certDomains.map(d=>({name:d.name.split(" ")[0],full:d.name,score:domainMastery(certQuestions.filter(q=>q.domain===d.id),state.answered),color:d.color}));
  const objectives=objectiveStats(certQuestions,state.answered).slice(0,6);
  const history=certAttempts.slice(-10).map((a,i)=>({name:`#${i+1}`,score:pct(a.score,a.total)}));
  const readiness=certAttempts.length?Math.round(certAttempts.reduce((x,a)=>x+pct(a.score,a.total),0)/certAttempts.length):0;

  // All-tracks overview: readiness and streak for every certification in canonical
  // order, with the active one pulled to the top. Coming-soon tracks appear as
  // roadmap rows so the overview doubles as a track availability map.
  const tracks=sortCertifications(certifications).map(c=>{
    const ca=state.attempts.filter(a=>a.certId===c.id);
    return { id:c.id, name:c.name, shortName:c.shortName, active:c.id===cert, available:isCertAvailable(c),
      readiness:ca.length?Math.round(ca.reduce((x,a)=>x+pct(a.score,a.total),0)/ca.length):0,
      exams:ca.length, streak:state.progress[c.id]?.streak ?? 0 };
  }).sort((a,b)=>Number(b.active)-Number(a.active));

  return <><PageHead/>
    {tracks.length>1 && <div className="panel"><div className="panel-title"><div><span>ALL TRACKS</span><h3>Progress across certifications</h3></div></div><div className="domain-list">{tracks.map(t=><div className="domain-row" key={t.id}><span className="domain-dot" style={{background:t.active?"#36d6b5":t.available?"var(--muted)":"var(--line)"}}/><div><b>{t.name}{t.active?" · active":""}</b><small>{!t.available?"Coming soon · in development":t.exams?`${t.exams} exam${t.exams>1?"s":""} · ${t.streak} day streak`:"No attempts yet"}</small></div>{t.available?<><div className="thin-progress"><i style={{width:`${t.readiness}%`,background:t.active?"#36d6b5":"var(--muted)"}}/></div><strong>{t.readiness}%</strong></>:<span className="track-soon-tag">Soon</span>}</div>)}</div></div>}
    <div className="analytics-grid"><div className="panel"><div className="panel-title"><div><span>DOMAIN MASTERY</span><h3>Coverage by domain</h3></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={rows} layout="vertical" margin={{left:15}}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis type="number" domain={[0,100]} stroke="var(--muted)"/><YAxis dataKey="name" type="category" width={80} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Bar dataKey="score" radius={[0,6,6,0]}>{rows.map(r=><Cell key={r.full} fill={r.color}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="panel readiness-card"><span>READINESS SIGNAL</span><div className="big-score">{readiness}<sup>%</sup></div><p>Based on completed practice sessions. Aim for consistent 85%+ results across every domain.</p><div className="readiness-bands"><i/><i/><i/><i/></div><small>Building foundation · Developing · Ready · Strong</small></div></div><div className="panel chart-panel"><div className="panel-title"><div><span>RECENT SESSIONS</span><h3>Score trajectory</h3></div></div>{history.length?<ResponsiveContainer width="100%" height={260}><AreaChart data={history}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area dataKey="score" stroke="#36d6b5" fill="#36d6b533" strokeWidth={3}/></AreaChart></ResponsiveContainer>:<Empty message="Your score history will appear after your first session."/>}</div><div className="history-list panel"><div className="panel-title"><div><span>WEAKEST OBJECTIVES</span><h3>Where to focus next</h3></div></div>{objectives.length?objectives.map(o=><div key={o.objective}><span className={o.mastery>=75?"pass":""}>{o.mastery}%</span><div><b>{o.objective}</b><small>{o.mastered}/{o.total} questions mastered</small></div><strong>{certDomains.find(d=>d.id===o.domain)?.name.split(" ")[0]}</strong></div>):<Empty message="Answer practice questions to surface your weakest objectives."/>}</div><div className="history-list panel"><div className="panel-title"><div><span>ATTEMPT LOG</span><h3>Recent activity</h3></div></div>{certAttempts.length?certAttempts.slice().reverse().map(a=><div key={a.id}><span className={pct(a.score,a.total)>=75?"pass":""}>{pct(a.score,a.total)}%</span><div><b>{a.exam} {a.kind==="mock"?"mock exam":"practice"}{a.kind==="mock"?(a.passed?" · PASS":" · FAIL"):""}</b><small>{new Date(a.date).toLocaleDateString()} · {a.score}/{a.total} correct</small></div><strong>{formatTime(a.durationSec)}</strong></div>):<Empty message="No attempts recorded yet."/>}</div></>;
}

function PageHead() {
  return <div className="page-title"><div><span className="eyebrow">INSIGHT ENGINE</span><h1>Performance analytics</h1><p>See the pattern behind your scores and put study time where it matters.</p></div></div>;
}

function Empty({message}:{message:string}) {
  return <div className="empty"><Brain/><p>{message}</p></div>;
}
