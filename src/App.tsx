import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserPage } from './pages/UserPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
