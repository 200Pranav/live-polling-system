import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { sendChat } from '../api';

export default function ChatWidget(){
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  useEffect(() => {
    const onNew = (m) => setMsgs((x) => [...x, m]);
    socket.on('chat:new', onNew);
    return () => socket.off('chat:new', onNew);
  }, []);
  return (
    <div className="chat">
      {open && (
        <div className="card" style={{width:320, marginBottom:8}}>
          <div className="flex-between" style={{marginBottom:8}}>
            <b>Class Chat</b>
            <button className="btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div style={{height:200, overflow:'auto', border:'1px solid #1f2937', borderRadius:12, padding:8}}>
            {msgs.map((m, i) => (<div key={i} className="small"><b>{m.from}:</b> {m.text}</div>))}
          </div>
          <div className="row" style={{marginTop:8}}>
            <input className="input" placeholder="Type..." value={text} onChange={e=>setText(e.target.value)} />
            <button className="btn primary" onClick={()=>{ if(text.trim()){ sendChat(text.trim()); setText(''); }}}>Send</button>
          </div>
        </div>
      )}
      <button className="btn" onClick={()=>setOpen(o=>!o)}>{open? 'Hide Chat' : 'Open Chat'}</button>
    </div>
  );
}
