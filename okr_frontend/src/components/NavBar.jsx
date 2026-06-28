import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function NavBar() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const profileInitial = (auth.user?.empName || '?').trim().charAt(0).toUpperCase() || '?';
  const userLevel = Number(auth.user?.empLevel || 0);
  const location = useLocation();

  const smartMenuItems = [];
  if (auth.isAuthenticated) {
    if (auth.isAdmin) {
      smartMenuItems.push({ label: "Employee Master", path: "/employee-master" });
      for (let level = 1; level <= 7; level += 1) {
        smartMenuItems.push({ label: `Level ${level} OKR Designer`, path: `/okr-workspace-level-${level}` });
      }
    } else if (userLevel >= 1 && userLevel <= 7) {
      smartMenuItems.push({ label: `Level ${userLevel} OKR Designer`, path: `/okr-workspace-level-${userLevel}` });
    }
  }

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full mb-2 site-nav flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 relative">
      <div className="brand cursor-pointer" onClick={() => navigate("/")}>
        <span className="brand-text">Objecto<span className="tm">™</span></span>
      </div>
      <ul className="nav-center absolute left-1/2 transform -translate-x-1/2 flex gap-4 lg:gap-6 text-sm lg:text-lg items-center">
        <li className={`nav-link transition cursor-pointer ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate("/")}>Home</li>
        {auth.isAdmin && (
          <li
          className={`nav-link transition cursor-pointer ${
            location.pathname === "/analytics" ? "active" : ""
          }`}
          onClick={() => navigate("/analytics")}
        >
          Analytics
        </li>
        )}
        {smartMenuItems.length > 0 && (
          <li className="relative" ref={dropdownRef}>
            <span
              className="nav-link transition cursor-pointer select-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              Smart OKR Designer
              <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 z-20 dropdown-panel py-3 px-3 min-w-65 flex flex-col gap-2">
                {smartMenuItems.map((item) => (
                  <button
                    key={item.path}
                    className={`text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium transition text-base nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(item.path);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </li>
        )}
        {auth.isAuthenticated && (
          <li className={`nav-link transition cursor-pointer ${location.pathname === '/okr-performance' ? 'active' : ''}`} onClick={() => navigate('/okr-performance')}>OKR Performance</li>
        )}
        {auth.isAdmin && (
          <li className={`nav-link transition cursor-pointer ${location.pathname === '/admin-users' ? 'active' : ''}`} onClick={() => navigate('/admin-users')}>User Management</li>
        )}
      </ul>
      <div className="flex items-center gap-2">
        {auth.isAuthenticated && auth.user?.empName ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              className="avatar"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setProfileMenuOpen((open) => !open)}
              title="Profile options"
              aria-label="Profile options"
            >
              {profileInitial}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 z-20 dropdown-panel py-2 px-2 min-w-40 flex flex-col gap-1">
                <button
                  className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium transition text-sm nav-link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/my-profile');
                  }}
                >
                  My Profile
                </button>
                <button
                  className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 font-medium transition text-sm nav-link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={async () => {
                    setProfileMenuOpen(false);
                    await auth.logout();
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="login-button px-5 py-2 rounded-full"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
