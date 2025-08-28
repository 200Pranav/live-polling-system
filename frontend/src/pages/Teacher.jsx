import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import NameGate from './NameGate';
import Countdown from '../components/Countdown';
import ResultsChart from '../components/ResultsChart';
import { socket } from '../socket';
import { hello, startPoll, kick } from '../api';
import ChatWidget from '../components/ChatWidget';

export default function Teacher(){
  const [name, setName] = useState(null);
  const [form, setForm] = useState({ question: '', options: 'A\nB\nC\nD', duration: 60 });
  const [current, setCurrent] = useState(null); // poll object
  const [tally, setTally] = useState(null);
  const [students, setStudents] = useState([]);
  const optionsArr = useMemo(() => form.options.split('\n').filter(Boolean).slice(0,6), [form.options]);

  useEffect(() => {
    const onStarted = (p) => { setCurrent(p); setTally(null); };
    const onTally = (t) => setTally(t);
    const onEnded = (e) => { setCurrent(null); setTally(e.tally); };
    const onPresence = ({ students }) => setStudents(students);

    socket.on('poll:started', onStarted);
    socket.on('poll:tally', onTally);
    socket.on('poll:ended', onEnded);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('poll:started', onStarted);
      socket.off('poll:tally', onTally);
      socket.off('poll:ended', onEnded);
      socket.off('presence:update', onPresence);
    };
  }, []);

  if (!name) return (
    <Layout>
      <NameGate onReady={(n)=>{ setName(n); hello(n, 'teacher'); }} />
    </Layout>
  );

  return (
    <Layout>
      <div className="flex-between">
        <div>
          <div className="kicker">Teacher</div>
          <h2 className="h">Welcome, {name}</h2>
        </div>
        {current && <Countdown deadline={current.deadline} />}
      </div>

      {!current && (
        <div className="grid">
          <label className="small">Question</label>
          <textarea className="input" rows={3} value={form.question} onChange={e=>setForm({...form, question:e.target.value})} placeholder="Type your question" />

          <label className="small">Options (one per line)</label>
          <textarea className="input" rows={4} value={form.options} onChange={e=>setForm({...form, options:e.target.value})} />

          <div className="row">
            <label className="small">Duration (seconds)</label>
            <input className="input" style={{width:120}} type="number" min="5" max="300" value={form.duration} onChange={e=>setForm({...form, duration:Number(e.target.value)})} />
            <button className="btn primary" onClick={()=>{
              const payload = { question: form.question.trim(), options: optionsArr, durationMs: (form.duration||60)*1000 };
              if(!payload.question || payload.options.length<2){ alert('Enter question and at least 2 options'); return; }
              startPoll(payload);
            }}>Start Poll</button>
          </div>
        </div>
      )}

      {current && (
        <div className="grid">
          <div className="kicker">Live</div>
          <h3 className="h">{current.question}</h3>
          <ResultsChart options={current.options} counts={tally?.counts || Array(current.options.length).fill(0)} />
          <div className="small">Voted {tally?.totalVoted || 0} / {tally?.cohortSize || 0}</div>
        </div>
      )}

      <hr />
      <div>
        <div className="kicker">Active Students</div>
        <div className="row" style={{marginTop:8, flexWrap:'wrap'}}>
          {students.map(s => (
            <div key={s.socketId} className="badge" style={{display:'flex', gap:8, alignItems:'center'}}>
              <span>👤 {s.name}</span>
              <button className="btn danger" onClick={()=>kick(s.socketId)}>Kick</button>
            </div>
          ))}
          {students.length===0 && <div className="small">No students connected.</div>}
        </div>
      </div>

      <ChatWidget />
    </Layout>
  );
}



