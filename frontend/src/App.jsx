import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from './layouts/MainLayout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<MainLayout />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
