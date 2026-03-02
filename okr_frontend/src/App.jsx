


import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import EmployeeMaster from './pages/EmployeeMaster';
import OKRWorkspaceLevel1 from './pages/OKRWorkspaceLevel1';
import OKRWorkspaceLevel2 from './pages/OKRWorkspaceLevel2';
import OKRWorkspaceLevel3 from './pages/OKRWorkspaceLevel3';
import OKRWorkspaceLevel4 from './pages/OKRWorkspaceLevel4';
import OKRWorkspaceLevel5 from './pages/OKRWorkspaceLevel5';
import OKRWorkspaceLevel6 from './pages/OKRWorkspaceLevel6';
import OKRWorkspaceLevel7 from './pages/OKRWorkspaceLevel7';
import OKRPerformance from './pages/OKRPerformance';

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
        <Route path="/" element={<Home />} />
        <Route path="/employee-master" element={<EmployeeMaster />} />
        <Route path="/okr-workspace-level-1" element={<OKRWorkspaceLevel1 />} />
        <Route path="/okr-workspace-level-2" element={<OKRWorkspaceLevel2 />} />
        <Route path="/okr-workspace-level-3" element={<OKRWorkspaceLevel3 />} />
        <Route path="/okr-workspace-level-4" element={<OKRWorkspaceLevel4 />} />
        <Route path="/okr-workspace-level-5" element={<OKRWorkspaceLevel5 />} />
        <Route path="/okr-workspace-level-6" element={<OKRWorkspaceLevel6 />} />
        <Route path="/okr-workspace-level-7" element={<OKRWorkspaceLevel7 />} />
        <Route path="/okr-performance" element={<OKRPerformance />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
