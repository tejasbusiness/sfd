import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/public/HomePage'
import ServicesIndexPage from './pages/public/ServicesIndexPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import PortfolioPage from './pages/public/PortfolioPage'
import PricingPage from './pages/public/PricingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesIndexPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
