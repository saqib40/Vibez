import { HashRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import RoomPage from "./pages/RoomPage"

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/join" element={<RoomPage/>}/>
      </Routes>
    </HashRouter>
  )
}

export default App
