import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { PrivacyPage } from './pages/PrivacyPage'
import { HomePage } from './pages/HomePage'
import { ScrollToHash } from './router/ScrollToHash'
import { SplashScreen } from './components/SplashScreen'

function App() {
  return (
    <>
      <SplashScreen durationMs={2000} />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
