// import React from 'react';
// export default function ResultsChart({ options = [], counts = [] }){
//   const max = Math.max(1, ...counts);
//   return (
//     <div className="grid">
//       {options.map((opt, i) => (
//         <div key={i}>
//           <div className="small">{opt}</div>
//           <div style={{background:'#0b1220', border:'1px solid #1f2937', borderRadius:12, overflow:'hidden'}}>
//             <div style={{height:16, width:`${(counts[i]||0)/max*100}%`, background:'var(--acc)'}} />
//           </div>
//           <div className="small">Votes: {counts[i]||0}</div>
//         </div>
//       ))}
//     </div>
//   );
// }


import React from 'react';

export default function ResultsChart({ options = [], counts = [] }) {
  console.log("ResultsChart rendering...", options, counts); // 🔍 debug

  const max = Math.max(1, ...counts);

  return (
    <div className="grid" style={{ gap: "10px", marginTop: "20px" }}>
      {options.map((opt, i) => (
        <div key={i}>
          <div className="small">{opt}</div>
          <div
            style={{
              background: "#0b1220",
              border: "1px solid #1f2937",
              borderRadius: 12,
              overflow: "hidden",
              height: 16,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((counts[i] || 0) / max) * 100}%`,
                background: "blue", // use fixed color for testing
              }}
            />
          </div>
          <div className="small">Votes: {counts[i] || 0}</div>
        </div>
      ))}
    </div>
  );
}
