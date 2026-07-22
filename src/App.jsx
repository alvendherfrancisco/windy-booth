import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppShell from '@/components/AppShell';
import Dashboard from '@/pages/Dashboard';
import Booth from '@/pages/Booth';
import MyBooths from '@/pages/MyBooths';
import PrintShop from '@/pages/PrintShop';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  const publicPath = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError && authError.type === 'user_not_registered' && !publicPath) return <UserNotRegisteredError />;
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booth" element={<Booth />} />
        <Route path="/my-booths" element={<MyBooths />} />
        <Route path="/print-shop" element={<PrintShop />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>;
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App