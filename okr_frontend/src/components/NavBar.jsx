import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  ["Employee Master", "Level 1 OKR Designer", "Level 2 OKR Designer", "Level 3 OKR Designer", "Level 4 OKR Designer"],
  ["Level 5 OKR Designer", "Level 6 OKR Designer", "Level 7 OKR Designer", "View Your OKRs", "OKR Reviews"]
];

export default function NavBar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-blue-700 text-white shadow-blue-glow flex items-center justify-between px-8 py-4 relative">
      <div className="font-bold text-2xl tracking-wide cursor-pointer" onClick={() => navigate("/")}>OKR System</div>
      <ul className="flex gap-6 text-lg items-center">
        <li className="hover:text-blue-200 transition cursor-pointer" onClick={() => navigate("/")}>Home</li>
        <li className="hover:text-blue-200 transition cursor-pointer">Objectives</li>
        <li className="relative" ref={dropdownRef}>
          <span
            className="hover:text-blue-200 transition cursor-pointer select-none"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Smart OKR Designer
            <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </span>
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 z-20 bg-white text-blue-800 rounded-xl shadow-lg py-3 px-4 min-w-[260px] border border-blue-100 flex flex-col gap-2">
              {menuItems.flat().map((item, idx) => (
                <button
                  key={idx}
                  className="text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-900 font-medium transition text-base"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (item === "Employee Master") {
                      navigate("/employee-master");
                    } else if (item === "Level 1 OKR Designer") {
                      navigate("/okr-workspace-level-1");
                    } else if (item === "Level 2 OKR Designer") {
                      navigate("/okr-workspace-level-2");
                    } else if (item === "Level 3 OKR Designer") {
                      navigate("/okr-workspace-level-3");
                    } else if (item === "Level 4 OKR Designer") {
                      navigate("/okr-workspace-level-4");
                    } else if (item === "Level 5 OKR Designer") {
                      navigate("/okr-workspace-level-5");
                    } else if (item === "Level 6 OKR Designer") {
                      navigate("/okr-workspace-level-6");
                    } else if (item === "Level 7 OKR Designer") {
                      navigate("/okr-workspace-level-7");
                    }
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </li>
        <li className="hover:text-blue-200 transition cursor-pointer">About</li>
      </ul>
      <button className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-xl shadow-blue-glow hover:bg-blue-100 transition">
        Login
      </button>
    </nav>
  );
}
