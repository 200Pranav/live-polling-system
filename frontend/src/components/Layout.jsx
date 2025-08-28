import React from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }){
  return (
    <div className="container">
      <div className="flex-between" style={{marginBottom:16}}>
        <div>
          <div className="kicker">Intervue — Live Poll</div>
          <h1 className="h">Polling System</h1>
        </div>
        <div className="row">
          <Link className="btn" to="/">Home</Link>
          <Link className="btn" to="/teacher">Teacher</Link>
          <Link className="btn" to="/student">Student</Link>
        </div>
      </div>
      <div className="card">{children}</div>
    </div>
  );
}
