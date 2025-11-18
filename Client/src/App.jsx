import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/Login'
import Aventuras from './components/Aventuras'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aventuras" element={<Aventuras />} />
      </Routes>
    </Router>
    
  )
}

export default App
