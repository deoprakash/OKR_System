


import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import EmployeeMaster from './pages/EmployeeMaster';
import OKRWorkspaceLevel1 from './pages/OKRWorkspaceLevel1';
import OKRWorkspaceLevel2 from './pages/OKRWorkspaceLevel2';
import OKRWorkspaceLevel3 from './pages/OKRWorkspaceLevel3';
import OKRWorkspaceLevel4 from './pages/OKRWorkspaceLevel4';
import OKRWorkspaceLevel5 from './pages/OKRWorkspaceLevel5';
import OKRWorkspaceLevel6 from './pages/OKRWorkspaceLevel6';
import OKRWorkspaceLevel7 from './pages/OKRWorkspaceLevel7';
import OKRPerformance from './pages/OKRPerformance';
import MyProfile from './pages/MyProfile';
import { useAuth } from './context/useAuth';

function Protected({ children, adminOnly = false }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen bg-[#0f1724] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !auth.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedLevel({ children, level }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen bg-[#0f1724] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!auth.isAdmin && Number(auth.user?.empLevel || 0) !== Number(level)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const Router = window && window.location && window.location.protocol === 'file:'
    ? HashRouter
    : BrowserRouter;
  // Ensure clicks on inputs re-focus the window (helps Electron when window loses focus)
  useEffect(() => {
    function ensureFocusForTarget(t) {
      try {
        const isInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
        if (!isInput) return;
        if (typeof document.hasFocus === 'function' && !document.hasFocus() && typeof window.focus === 'function') {
          try { window.focus(); } catch {}
        }
        setTimeout(() => {
          try {
            if (t && typeof t.focus === 'function') t.focus();
          } catch {}
        }, 10);
      } catch {}
    }
    function onMouseDown(e) {
      try {
        const t = e.target;
        ensureFocusForTarget(t);
      } catch {}
    }
    function onFocusIn(e) {
      try {
        const t = e.target;
        ensureFocusForTarget(t);
      } catch {}
    }
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/my-profile" element={<Protected><MyProfile /></Protected>} />
        <Route path="/employee-master" element={<Protected adminOnly><EmployeeMaster /></Protected>} />
        <Route path="/okr-workspace-level-1" element={<ProtectedLevel level={1}><OKRWorkspaceLevel1 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-2" element={<ProtectedLevel level={2}><OKRWorkspaceLevel2 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-3" element={<ProtectedLevel level={3}><OKRWorkspaceLevel3 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-4" element={<ProtectedLevel level={4}><OKRWorkspaceLevel4 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-5" element={<ProtectedLevel level={5}><OKRWorkspaceLevel5 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-6" element={<ProtectedLevel level={6}><OKRWorkspaceLevel6 /></ProtectedLevel>} />
        <Route path="/okr-workspace-level-7" element={<ProtectedLevel level={7}><OKRWorkspaceLevel7 /></ProtectedLevel>} />
        <Route path="/okr-performance" element={<Protected><OKRPerformance /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
