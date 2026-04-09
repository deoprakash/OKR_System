import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    <nav className="w-full mb-2 text-white bg-blue-700/95 backdrop-blur-sm border-b border-blue-300/30 shadow-lg flex items-center justify-between px-8 py-4 relative">
      <div className="font-bold text-2xl tracking-wide cursor-pointer" onClick={() => navigate("/")}>OKR System</div>
      <ul className="flex gap-6 text-lg items-center">
        <li className="hover:text-blue-200 transition cursor-pointer" onClick={() => navigate("/")}>Home</li>
        {smartMenuItems.length > 0 && (
          <li className="relative" ref={dropdownRef}>
            <span
              className="hover:text-blue-200 transition cursor-pointer select-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              Smart OKR Designer
              <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </span>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 z-20 bg-white text-blue-800 rounded-xl shadow-lg py-3 px-4 min-w-65 border border-blue-100 flex flex-col gap-2">
                {smartMenuItems.map((item) => (
                  <button
                    key={item.path}
                    className="text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-900 font-medium transition text-base"
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
          <li className="hover:text-blue-200 transition cursor-pointer" onClick={() => navigate('/okr-performance')}>OKR Performance</li>
        )}
      </ul>
      <div className="flex items-center gap-2">
        {auth.isAuthenticated && auth.user?.empName ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              className="w-10 h-10 rounded-full bg-white text-blue-700 font-bold shadow hover:bg-blue-50 transition border border-blue-200 flex items-center justify-center"
              onClick={() => setProfileMenuOpen((open) => !open)}
              title="Profile options"
              aria-label="Profile options"
            >
              {profileInitial}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 z-20 bg-white text-blue-800 rounded-xl shadow-lg py-2 px-2 min-w-40 border border-blue-100 flex flex-col gap-1">
                <button
                  className="text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-900 font-medium transition text-sm"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/my-profile');
                  }}
                >
                  My Profile
                </button>
                <button
                  className="text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-900 font-medium transition text-sm"
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
            className="bg-white text-blue-700 font-semibold px-5 py-2 rounded-xl shadow hover:bg-blue-50 transition"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
