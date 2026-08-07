import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmployeeMaster from "./pages/EmployeeMaster";
import AdminUsers from "./pages/AdminUsers";
import OKRWorkspace from "./pages/OKRWorkspace";
import OKRPerformance from "./pages/OKRPerformance";
import MyProfile from "./pages/MyProfile";
import Setup from "./pages/Setup";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "./context/useAuth";
import Analytics from "./pages/Analytics";

function Protected({ children, adminOnly = false }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-6">Loading…</div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-6">Loading…</div>
      </div>
    );
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
  const Router =
    window && window.location && window.location.protocol === "file:"
      ? HashRouter
      : BrowserRouter;
  // Ensure clicks on inputs re-focus the window (helps Electron when window loses focus)
  useEffect(() => {
    const revealSelector = ".scroll-reveal, [data-reveal], .glass-card, .card";

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const observeReveals = (root = document) => {
      root.querySelectorAll(revealSelector).forEach((element) => {
        if (element.dataset.revealObserved === "true") return;
        element.dataset.revealObserved = "true";
        revealObserver.observe(element);
      });
    };

    observeReveals();

    const mutationObserver = new MutationObserver(() => {
      observeReveals();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    function ensureFocusForTarget(t) {
      try {
        const isInput =
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.tagName === "SELECT");
        if (!isInput) return;
        if (
          typeof document.hasFocus === "function" &&
          !document.hasFocus() &&
          typeof window.focus === "function"
        ) {
          try {
            window.focus();
          } catch (err) {
            void err;
          }
        }
        setTimeout(() => {
          try {
            if (t && typeof t.focus === "function") t.focus();
          } catch (err) {
            void err;
          }
        }, 10);
      } catch (err) {
        void err;
      }
    }
    function onMouseDown(e) {
      try {
        const t = e.target;
        ensureFocusForTarget(t);
      } catch (err) {
        void err;
      }
    }
    function onFocusIn(e) {
      try {
        const t = e.target;
        ensureFocusForTarget(t);
      } catch (err) {
        void err;
      }
    }
    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/my-profile"
          element={
            <Protected>
              <MyProfile />
            </Protected>
          }
        />
        <Route
          path="/employee-master"
          element={
            <Protected adminOnly>
              <EmployeeMaster />
            </Protected>
          }
        />
        <Route
          path="/admin-users"
          element={
            <Protected adminOnly>
              <AdminUsers />
            </Protected>
          }
        />
        <Route
          path="/okr-workspace-level-1"
          element={
            <ProtectedLevel level={1}>
              <OKRWorkspace level={1} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-2"
          element={
            <ProtectedLevel level={2}>
              <OKRWorkspace level={2} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-3"
          element={
            <ProtectedLevel level={3}>
              <OKRWorkspace level={3} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-4"
          element={
            <ProtectedLevel level={4}>
              <OKRWorkspace level={4} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-5"
          element={
            <ProtectedLevel level={5}>
              <OKRWorkspace level={5} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-6"
          element={
            <ProtectedLevel level={6}>
              <OKRWorkspace level={6} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-workspace-level-7"
          element={
            <ProtectedLevel level={7}>
              <OKRWorkspace level={7} />
            </ProtectedLevel>
          }
        />
        <Route
          path="/okr-performance"
          element={
            <Protected>
              <OKRPerformance />
            </Protected>
          }
        />
        <Route
          path="/analytics"
          element={
            <Protected>
              {" "}
              <Analytics />{" "}
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
