import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingModalProvider } from './context/BookingModalContext'
import HomePage from './pages/public/HomePage'
import ServicesIndexPage from './pages/public/ServicesIndexPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import PortfolioPage from './pages/public/PortfolioPage'
import PricingPage from './pages/public/PricingPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import ManageBookingPage from './pages/public/ManageBookingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import { adminRoute } from './components/admin/adminRoute'
import AdminLeadsPage from './pages/admin/AdminLeadsPage'
import AdminLeadDetailPage from './pages/admin/AdminLeadDetailPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminBookingFormPage from './pages/admin/AdminBookingFormPage'
import AdminAvailabilityPage from './pages/admin/AdminAvailabilityPage'
import AdminContentHubPage from './pages/admin/AdminContentHubPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import AdminTicketDetailPage from './pages/admin/AdminTicketDetailPage'
import { clientRoute } from './components/client/clientRoute'
import ClientTicketsPage from './pages/client/ClientTicketsPage'
import ClientTicketDetailPage from './pages/client/ClientTicketDetailPage'
import AdminServicesListPage from './pages/admin/content/AdminServicesListPage'
import AdminServiceFormPage from './pages/admin/content/AdminServiceFormPage'
import AdminPricingListPage from './pages/admin/content/AdminPricingListPage'
import AdminPricingFormPage from './pages/admin/content/AdminPricingFormPage'
import AdminPortfolioListPage from './pages/admin/content/AdminPortfolioListPage'
import AdminPortfolioFormPage from './pages/admin/content/AdminPortfolioFormPage'
import AdminTestimonialsListPage from './pages/admin/content/AdminTestimonialsListPage'
import AdminTestimonialFormPage from './pages/admin/content/AdminTestimonialFormPage'
import AdminBlogListPage from './pages/admin/content/AdminBlogListPage'
import AdminBlogFormPage from './pages/admin/content/AdminBlogFormPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingModalProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesIndexPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/manage-booking" element={<ManageBookingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/leads" element={adminRoute(<AdminLeadsPage />)} />
            <Route path="/admin/leads/:id" element={adminRoute(<AdminLeadDetailPage />)} />
            <Route path="/admin/bookings" element={adminRoute(<AdminBookingsPage />)} />
            <Route path="/admin/bookings/new" element={adminRoute(<AdminBookingFormPage />)} />
            <Route path="/admin/bookings/:id" element={adminRoute(<AdminBookingFormPage />)} />
            <Route path="/admin/availability" element={adminRoute(<AdminAvailabilityPage />)} />
            <Route path="/admin/content" element={adminRoute(<AdminContentHubPage />)} />
            <Route path="/admin/content/services" element={adminRoute(<AdminServicesListPage />)} />
            <Route path="/admin/content/services/new" element={adminRoute(<AdminServiceFormPage />)} />
            <Route path="/admin/content/services/:id" element={adminRoute(<AdminServiceFormPage />)} />
            <Route path="/admin/content/pricing" element={adminRoute(<AdminPricingListPage />)} />
            <Route path="/admin/content/pricing/new" element={adminRoute(<AdminPricingFormPage />)} />
            <Route path="/admin/content/pricing/:id" element={adminRoute(<AdminPricingFormPage />)} />
            <Route path="/admin/content/portfolio" element={adminRoute(<AdminPortfolioListPage />)} />
            <Route path="/admin/content/portfolio/new" element={adminRoute(<AdminPortfolioFormPage />)} />
            <Route path="/admin/content/portfolio/:id" element={adminRoute(<AdminPortfolioFormPage />)} />
            <Route path="/admin/content/testimonials" element={adminRoute(<AdminTestimonialsListPage />)} />
            <Route path="/admin/content/testimonials/new" element={adminRoute(<AdminTestimonialFormPage />)} />
            <Route path="/admin/content/testimonials/:id" element={adminRoute(<AdminTestimonialFormPage />)} />
            <Route path="/admin/content/blog" element={adminRoute(<AdminBlogListPage />)} />
            <Route path="/admin/content/blog/new" element={adminRoute(<AdminBlogFormPage />)} />
            <Route path="/admin/content/blog/:id" element={adminRoute(<AdminBlogFormPage />)} />
            <Route path="/admin/settings" element={adminRoute(<AdminSettingsPage />)} />
            <Route path="/admin/tickets" element={adminRoute(<AdminTicketsPage />)} />
            <Route path="/admin/tickets/:id" element={adminRoute(<AdminTicketDetailPage />)} />
            <Route path="/client" element={<Navigate to="/client/tickets" replace />} />
            <Route path="/client/tickets" element={clientRoute(<ClientTicketsPage />)} />
            <Route path="/client/tickets/:id" element={clientRoute(<ClientTicketDetailPage />)} />
          </Routes>
        </BookingModalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
