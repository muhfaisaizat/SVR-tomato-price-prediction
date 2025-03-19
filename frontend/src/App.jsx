import { useState } from 'react'
// import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Layout from './pages/Panel/Main/layout';
import ProtectedRoute from './protectedRoute.jsx';
import PublicRoute from './publicRoute.jsx';


function App() {
 

  return (
    <Router>
    <Routes>
      <Route path="/" element={<PublicRoute element={LandingPage} />} />
      <Route path="/panel/*" element={<ProtectedRoute element={<Layout />} />} />
    </Routes>
  </Router>
  )
}

export default App
