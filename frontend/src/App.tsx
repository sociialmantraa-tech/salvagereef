import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/useAuthStore';
import api from './services/api';
import PageLoading from './components/PageLoading';

// ─── Lazy-loaded views (code splitting — each view loads only when visited) ───
const Home            = lazy(() => import('./views/Home'));
const Auctions        = lazy(() => import('./views/Auctions'));
const AuctionDetail   = lazy(() => import('./views/AuctionDetail'));
const Classifieds     = lazy(() => import('./views/Classifieds'));
const ClassifiedDetail= lazy(() => import('./views/ClassifiedDetail'));
const PostListing     = lazy(() => import('./views/PostListing'));
const Login           = lazy(() => import('./views/Login'));
const Register        = lazy(() => import('./views/Register'));
const UserDashboard   = lazy(() => import('./views/UserDashboard'));
const AdminDashboard  = lazy(() => import('./views/AdminDashboard'));
const About           = lazy(() => import('./views/About'));
const TermsAndConditions = lazy(() => import('./views/TermsAndConditions'));
const PrivacyPolicy   = lazy(() => import('./views/PrivacyPolicy'));
const Disclaimer      = lazy(() => import('./views/Disclaimer'));
const CopyrightPolicy = lazy(() => import('./views/CopyrightPolicy'));
const Contact         = lazy(() => import('./views/Contact'));
const ErrorPage       = lazy(() => import('./views/ErrorPage'));
const MaintenancePage = lazy(() => import('./views/MaintenancePage'));

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
  const isAdminRole = user?.role === 'admin' || user?.role === 'master_admin' || user?.role === 'desk_admin' || user?.role === 'read_only_admin';
  const isSellerRole = user?.role === 'agent' || user?.role === 'seller';
  if (roleRequired === 'agent' && !isSellerRole && !isAdminRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'master_admin' ||
    user?.role === 'desk_admin' ||
    user?.role === 'read_only_admin' ||
    user?.email === 'admin@salvagereef.com' ||
    user?.email === 'executive@salvagereef.com' ||
    localStorage.getItem('sr_admin_auth') === 'true' ||
    sessionStorage.getItem('sr_admin_auth') === 'true';

  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const { user, checkAuth } = useAuthStore();
  const [initialChecking, setInitialChecking] = useState(true);
  const [isMaintenance, setIsMaintenance]     = useState(false);
  const [systemMode, setSystemMode]           = useState<'online' | 'maintenance' | 'temporary_closed'>('online');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const checkSystemStatus = async () => {
    try {
      const res = await api.get('/system/status', { params: { _t: Date.now() } });
      const mode = res.data?.system_mode || (res.data?.maintenance_mode ? 'maintenance' : 'online');
      setSystemMode(mode);
      if (mode !== 'online') {
        setIsMaintenance(true);
        setMaintenanceMessage(
          res.data.message ||
            (mode === 'temporary_closed'
              ? 'SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!'
              : 'SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!')
        );
      } else {
        setIsMaintenance(false);
      }
    } catch {
      // Proceed normally if status check fails
    }
  };

  useEffect(() => {
    // Instantly remove HTML static preloader if present
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => preloader.remove(), 200);
    }

    const init = async () => {
      try {
        // Run startup tasks with 1.5s cap for reliable status detection
        await Promise.all([
          withTimeout(checkAuth(), 1500),
          withTimeout(checkSystemStatus(), 1500),
          // Fetch DB content, categories & locations non-critically in background
          (async () => {
            try {
              const { useContentStore } = await import('./store/useContentStore');
              const { useCategoryLocationStore } = await import('./store/useCategoryLocationStore');
              useContentStore.getState().fetchContentFromApi().catch(() => {});
              useCategoryLocationStore.getState().fetchCategoriesAndLocations().catch(() => {});
            } catch {}
          })(),
        ]);
      } catch {}
    };

    // Absolute hard cap: show the site after 1.2 seconds max no matter what
    const hardCap = setTimeout(() => setInitialChecking(false), 1200);
    init().finally(() => {
      clearTimeout(hardCap);
      setInitialChecking(false);
    });
  }, []);

  // Instant local synchronization when admin changes mode
  useEffect(() => {
    const handleModeChange = (e: any) => {
      const mode = e.detail?.mode || 'online';
      setSystemMode(mode);
      setIsMaintenance(mode !== 'online');
      if (mode === 'temporary_closed') {
        setMaintenanceMessage(e.detail?.temporaryClosedMessage || 'SalvageReef operations are temporarily closed for standard maintenance and operational update. We will reopen shortly!');
      } else if (mode === 'maintenance') {
        setMaintenanceMessage(e.detail?.message || 'SalvageReef is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly!');
      }
    };
    window.addEventListener('sr_system_mode_changed', handleModeChange);
    return () => window.removeEventListener('sr_system_mode_changed', handleModeChange);
  }, []);

  // Real-time synchronization across all browsers: Check status on every navigation and every 4 seconds
  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(() => {
      checkSystemStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  if (initialChecking) {
    return <PageLoading message="Initializing B2B Auctions & Scrap Desk..." />;
  }

  const isBypassPath = location.pathname.startsWith('/admin');

  if (isMaintenance && !isBypassPath) {
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
              <Route path="/disclaimer"            element={<Disclaimer />} />
              <Route path="/copyright-policy"      element={<CopyrightPolicy />} />
              <Route path="/auctions"              element={<Auctions />} />
              <Route path="/auctions/:slug"        element={<AuctionDetail />} />
              <Route path="/classifieds"           element={<Classifieds />} />
              <Route path="/classifieds/:slug"     element={<ClassifiedDetail />} />
              <Route
                path="/sell-scrap"
                element={
                  <ProtectedRoute>
                    <PostListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sell-your-scrap"
                element={
                  <ProtectedRoute>
                    <PostListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classifieds/post-listing"
                element={
                  <ProtectedRoute>
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
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
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
