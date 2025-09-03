import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>XBrain Desktop</h1>
      <p>Vite + React + TypeScript + Tauri</p>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
    </div>
  )
}

export default App
