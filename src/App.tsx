import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoadingPage from './pages/LoadingPage';
import RecipePage from './pages/RecipePage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import BottomNav from './components/BottomNav';

const MAIN_TABS = ['/', '/community', '/profile'];

function AppShell() {
  const { pathname } = useLocation();
  const { user, loading } = useAuthContext();
  const showNav = MAIN_TABS.includes(pathname);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
      </Routes>

      {showNav && <BottomNav />}
      {showNav && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-slate-800 rounded-full z-50" />
      )}
    </>
  );
}

export default function App() {
  return (
    <div className="max-w-md mx-auto h-screen bg-[#FDFBF7] relative flex flex-col font-sans overflow-hidden shadow-2xl sm:border-x sm:border-slate-200">
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </div>
  );
}
