import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import NameGate from './NameGate';
import Countdown from '../components/Countdown';
import ResultsChart from '../components/ResultsChart';
import { socket } from '../socket';
import { hello, sendAnswer } from '../api';
import ChatWidget from '../components/ChatWidget';

export default function Student() {
  const [name, setName] = useState(null);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tally, setTally] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onStarted = (p) => { setCurrent(p); setSubmitted(false); setSelected(null); setTally(null); };
    const onTally = (t) => setTally(t);
    const onEnded = (e) => { setCurrent(null); setTally(e.tally); };
    const onKick = () => { alert('You were removed by the teacher.'); window.location.href = '/'; };

    socket.on('poll:started', onStarted);
    socket.on('poll:tally', onTally);
    socket.on('poll:ended', onEnded);
    socket.on('system:kicked', onKick);

    return () => {
      socket.off('poll:started', onStarted);
      socket.off('poll:tally', onTally);
      socket.off('poll:ended', onEnded);
      socket.off('system:kicked', onKick);
    };
  }, []);

  useEffect(() => {
    const left = current ? Math.max(0, current.deadline - Date.now()) : 0;
    if (current && left <= 0) setSubmitted(true);
  }, [current]);

  if (!name) return (
    <Layout>
      <NameGate onReady={(n) => { setName(n); hello(n, 'student'); }} />
    </Layout>
  );

  const canSubmit = current && selected !== null && !submitted && Date.now() < current.deadline;

  return (
    <Layout>
      <div className="flex-between" style={{ marginBottom: "1rem" }}>
        <div>
          <div className="kicker">Student</div>
          <h2 className="h" style={{ color: "#222" }}>Hi, {name}</h2>
        </div>
        {current && <Countdown deadline={current.deadline} />}
      </div>

      {!current && !tally && (
        <p className="small" style={{ color: "#222" }}>
            Waiting for the teacher to start a poll…
        </p>
      )}

      {current && (
        <div className="poll-card" style={{ padding: "20px", background: "#f9f9f9", borderRadius: "10px" }}>
          <h3 style={{ color: "#111", marginBottom: "1rem" }}>{current.question}</h3>
          <div className="options" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: selected === i ? "2px solid #007bff" : "1px solid #ccc",
                  background: selected === i ? "#e6f0ff" : "#fff",
                  cursor: submitted ? "not-allowed" : "pointer",
                  textAlign: "left"
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="row" style={{ marginTop: "15px" }}>
            <button
              className="btn primary"
              disabled={!canSubmit}
              onClick={() => {
                sendAnswer(selected);
                setSubmitted(true);
              }}
            >
              Submit
            </button>
            {submitted && <span className="badge" style={{ marginLeft: "10px" }}>Submitted</span>}
          </div>
        </div>
      )}

      {(submitted || !current) && tally && (
        <div style={{ marginTop: 24, padding: "16px", background: "#f1f1f1", borderRadius: "8px" }}>
          <div className="kicker">Results</div>
          <ResultsChart options={current?.options || []} counts={tally.counts} />
          <div className="small">Voted {tally.totalVoted} / {tally.cohortSize}</div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <ChatWidget />
      </div>
    </Layout>
  );
}
