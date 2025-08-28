import React, { useEffect, useState } from 'react';
export default function Countdown({ deadline }){
  const [left, setLeft] = useState(Math.max(0, deadline - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, deadline - Date.now())), 200);
    return () => clearInterval(t);
  }, [deadline]);
  const s = Math.ceil(left/1000);
  return <span className="badge">⏳ {s}s</span>;
}