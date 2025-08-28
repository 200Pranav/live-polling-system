import React, { useState } from 'react';

export default function NameGate({ onReady }){
  const [name, setName] = useState(localStorage.getItem('lp_name') || '');
  return (
    <div className="grid" style={{gap:8}}>
      <label className="small">Enter your name (unique per tab):</label>
      <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
      <button className="btn primary" onClick={()=>{ if(name.trim()){ localStorage.setItem('lp_name', name.trim()); onReady(name.trim()); } }}>Continue</button>
    </div>
  );
}