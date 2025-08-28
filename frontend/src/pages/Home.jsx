import React from 'react';
import Layout from '../components/Layout';

export default function Home(){
  return (
    <Layout>
      <p className="small">Choose a role to begin:</p>
      <div className="row" style={{marginTop:8}}>
        <a className="btn primary" href="/teacher">Enter as Teacher</a>
        <a className="btn" href="/student">Enter as Student</a>
      </div>
      <hr />
      <div className="small">Socket URL: {process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}</div>
    </Layout>
  );
}