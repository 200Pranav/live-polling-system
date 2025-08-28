import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Teacher from './pages/Teacher';
import Student from './pages/Student';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="/student" element={<Student />} />
    </Routes>
  );
}
