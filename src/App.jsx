import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useStore from './store/useStore';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CheckInModal from './components/CheckInModal';

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Coach from './pages/Coach';
import Nutrition from './pages/Nutrition';
import Workout from './pages/Workout';
import Care from './pages/Care';
import Plan from './pages/Plan';
import Progress from './pages/Progress';

// Hooks
import { useNotifications } from './hooks/useNotifications';

function AppContent() {
  const { profile, hydrated, hydrate, lastCheckin } = useStore();
  const location = useLocation();
  useNotifications();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const shouldCheckIn = () => {
    if (!profile) return false; 
    if (!lastCheckin) return true;
    const diff = (Date.now() - new Date(lastCheckin).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 7;
  };

  if (!hydrated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06090f' }}>
        <div style={{ fontSize: '40px', animation: 'pulse 1s infinite' }}>💪</div>
      </div>
    );
  }

  if (!profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  const showNav = location.pathname !== '/onboarding';
  const showCheckIn = shouldCheckIn();

  return (
    <div className="app-container">
      {showNav && <Header />}
      {showCheckIn && <CheckInModal />}
      <div style={{ paddingBottom: showNav ? '85px' : '0' }}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/care" element={<Care />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  );
}
