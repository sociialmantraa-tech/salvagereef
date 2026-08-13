import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/useAuthStore';
import api from './services/api';
import PageLoading from './components/PageLoading';

// ─── Lazy-loaded pages (code splitting — each page loads only when visited) ───
const Home            = lazy(() => import('./pages/Home'));
const Auctions        = lazy(() => import('./pages/Auctions'));
const AuctionDetail   = lazy(() => import('./pages/AuctionDetail'));
const Classifieds     = lazy(() => import('./pages/Classifieds'));
const ClassifiedDetail= lazy(() => import('./pages/ClassifiedDetail'));
const PostListing     = lazy(() => import('./pages/PostListing'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const UserDashboard   = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const About           = lazy(() => import('./pages/About'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'));
const CopyrightPolicy = lazy(() => import('./pages/CopyrightPolicy'));
const Contact         = lazy(() => import('./pages/Contact'));
const ErrorPage       = lazy(() => import('./pages/ErrorPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// Lightweight inline fallback — no Logo import needed, avoids circular load
const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#D48B1C] rounded-full animate-spin" />
  </div>
);

// ─── Utility: promise that resolves after N ms ───────────────────────────────
const timeout = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// ─── Utility: race a promise against a timeout, resolve either way ───────────
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  try {
    return await Promise.race([promise, timeout(ms).then(() => null)]);
  } catch {
    return null;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired?: string;
}

function ProtectedRoute({ children, roleRequired }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roleRequired && user?.role !== roleRequired && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { user, checkAuth } = useAuthStore();
  const [initialChecking, setInitialChecking] = useState(true);
  const [isMaintenance, setIsMaintenance]     = useState(false);
  const [systemMode, setSystemMode]           = useState<'online' | 'maintenance' | 'temporary_closed'>('online');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const checkSystemStatus = async () => {
    try {
      const res = await api.get('/system/status');
      const mode = res.data?.system_mode || (res.data?.maintenance_mode ? 'maintenance' : 'online');
      setSystemMode(mode);
      if (mode !== 'online') {
        setIsMaintenance(true);
        setMaintenanceMessage(
          res.data.message ||
            (mode === 'temporary_closed'
              ? 'SalvageReef is temporarily closed for operations. We will reopen shortly!'
              : 'SalvageReef is currently undergoing scheduled maintenance.')
        );
      } else {
        setIsMaintenance(false);
      }
    } catch {
      // Proceed normally if status check fails
    }
  };

  useEffect(() => {
    const init = async () => {
      // ── Run all startup tasks in parallel with a hard 3-second cap ──────────
      // If the API is slow or unreachable, we NEVER block the user more than 3s.
      await Promise.all([
        withTimeout(checkAuth(), 3000),
        withTimeout(checkSystemStatus(), 3000),
        // Fetch DB content non-critically in background (no await needed)
        (async () => {
          try {
            const { useContentStore } = await import('./store/useContentStore');
            // Fire and forget — don't block initial render
            useContentStore.getState().fetchContentFromApi().catch(() => {});
          } catch {}
        })(),
      ]);
      setInitialChecking(false);
    };

    // Absolute hard cap: show the site after 4 seconds no matter what
    const hardCap = setTimeout(() => setInitialChecking(false), 4000);
    init().finally(() => clearTimeout(hardCap));
  }, []);

  if (initialChecking) {
    return <PageLoading message="Initializing B2B Auctions & Scrap Desk..." />;
  }

  if (isMaintenance && user?.role !== 'admin' && window.location.pathname !== '/login') {
    return (
      <Suspense fallback={<PageLoading />}>
        <MaintenancePage
          mode={systemMode}
          message={maintenanceMessage}
          onCheckStatus={checkSystemStatus}
        />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/"                      element={<Home />} />
              <Route path="/about"                 element={<About />} />
              <Route path="/contact"               element={<Contact />} />
              <Route path="/contact-us"            element={<Contact />} />
              <Route path="/terms"                 element={<TermsAndConditions />} />
              <Route path="/terms-and-conditions"  element={<TermsAndConditions />} />
              <Route path="/privacy-policy"        element={<PrivacyPolicy />} />
              <Route path="/copyright-policy"      element={<CopyrightPolicy />} />
              <Route path="/auctions"              element={<Auctions />} />
              <Route path="/auctions/:slug"        element={<AuctionDetail />} />
              <Route path="/classifieds"           element={<Classifieds />} />
              <Route path="/classifieds/:slug"     element={<ClassifiedDetail />} />
              <Route
                path="/classifieds/post-listing"
                element={
                  <ProtectedRoute roleRequired="agent">
                    <PostListing />
                  </ProtectedRoute>
                }
              />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roleRequired="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/maintenance" element={<MaintenancePage message={maintenanceMessage} onCheckStatus={checkSystemStatus} />} />
              <Route path="/500"  element={<ErrorPage code={500} />} />
              <Route path="*"     element={<ErrorPage code={404} />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </ErrorBoundary>
  );
}
