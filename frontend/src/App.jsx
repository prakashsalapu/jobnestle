import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Login from './pages/Login.jsx';
import OtpLogin from './pages/OtpLogin.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Register from './pages/Register.jsx';
import GoogleAuthCallback from './pages/GoogleAuthCallback.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import MyJobs from './pages/MyJobs.jsx';
import ReceivedApplications from './pages/ReceivedApplications.jsx';
import CreateJob from './pages/CreateJob.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/verify-otp" element={<OtpLogin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
          <Route path="/applications/received" element={<ProtectedRoute><ReceivedApplications /></ProtectedRoute>} />
          <Route path="/jobs/create" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
