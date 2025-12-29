import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserPage } from './pages/UserPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<UserPage />} />
        {/* Admin page will be added later */}
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
