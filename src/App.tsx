import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoadingPage from './pages/LoadingPage';
import RecipePage from './pages/RecipePage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

const MAIN_TABS = ['/', '/community', '/profile'];

export default function App() {
  const { pathname } = useLocation();
  const showNav = MAIN_TABS.includes(pathname);

  return (
    <div className="max-w-md mx-auto h-screen bg-[#FDFBF7] relative flex flex-col font-sans overflow-hidden shadow-2xl sm:border-x sm:border-slate-200">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {showNav && <BottomNav />}
      {showNav && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-slate-800 rounded-full z-50"></div>
      )}
    </div>
  );
}
