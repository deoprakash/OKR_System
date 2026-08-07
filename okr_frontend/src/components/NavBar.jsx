import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Button from "./ui/Button";

export default function NavBar() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileInitial = (auth.user?.empName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  const userName = auth.user?.empName || "";
  const userEmail = auth.user?.emailId || "";
  const userLevel = Number(auth.user?.empLevel || 0);
  const location = useLocation();

  const userRoleLabel = auth.isAdmin
    ? "Administrator"
    : userLevel >= 1 && userLevel <= 7
      ? `Level ${userLevel} Contributor`
      : "Team Member";

  const smartMenuSections = useMemo(() => {
    if (!auth.isAuthenticated) return [];

    if (auth.isAdmin) {
      return [
        {
          title: "Administration",
          description: "Manage users and access",
          items: [
            {
              label: "Employee Master",
              description: "Maintain employee records and level assignments.",
              path: "/employee-master",
              icon: "👤",
            },
          ],
        },
        {
          title: "Workspace levels",
          description: "Jump into any OKR designer level",
          items: Array.from({ length: 7 }, (_, index) => {
            const level = index + 1;
            return {
              label: `Level ${level} OKR Designer`,
              description: `Build and review objectives for level ${level}.`,
              path: `/okr-workspace-level-${level}`,
              icon: `L${level}`,
            };
          }),
        },
      ];
    }

    if (userLevel >= 1 && userLevel <= 7) {
      return [
        {
          title: "Your workspace",
          description: "Open the OKR designer assigned to you",
          items: [
            {
              label: `Level ${userLevel} OKR Designer`,
              description: `Manage objectives and key results for level ${userLevel}.`,
              path: `/okr-workspace-level-${userLevel}`,
              icon: `L${userLevel}`,
            },
          ],
        },
      ];
    }

    return [];
  }, [auth.isAdmin, auth.isAuthenticated, userLevel]);

  const primaryNavItems = useMemo(() => {
    const items = [
      { label: "Home", path: "/", description: "Dashboard and overview" },
    ];

    if (auth.isAuthenticated) {
      items.push({
        label: "OKR Performance",
        path: "/okr-performance",
        description: "Review results and trends",
      });
    }

    if (auth.isAdmin) {
      items.push({
        label: "Analytics",
        path: "/analytics",
        description: "See team-level analytics",
      });
      items.push({
        label: "User Management",
        path: "/admin-users",
        description: "Manage access and roles",
      });
    }

    return items;
  }, [auth.isAdmin, auth.isAuthenticated]);

  const currentPath = location.pathname;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      )
        setProfileMenuOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      )
        setMobileMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function handlePopState() {
      setDropdownOpen(false);
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isActive = (path) => currentPath === path;

  const closeMenus = () => {
    setDropdownOpen(false);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (path) =>
    [
      "group relative inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:text-brand-primary hover:shadow-sm",
      isActive(path) ? "text-brand-primary" : "text-neutral-600",
    ].join(" ");

  const renderNavUnderline = (path) => (
    <span
      className={[
        "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-200 ease-out",
        isActive(path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
      ].join(" ")}
    />
  );

  const handleNavigate = (path) => {
    closeMenus();
    navigate(path);
  };

  const renderSmartItem = (item) => (
    <button
      key={item.path}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => handleNavigate(item.path)}
      className={[
        "group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ease-out",
        isActive(item.path)
          ? "bg-blue-50/80 text-brand-primary shadow-sm"
          : "text-neutral-700 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-sm",
      ].join(" ")}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-bold text-white shadow-sm">
        {item.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-neutral-900">
          {item.label}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-neutral-500">
          {item.description}
        </span>
      </span>
      <span className="mt-1 text-neutral-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-primary">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
    </button>
  );

  return (
    <>
      <header className="sticky top-4 z-50 px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-screen-xl rounded-[24px] border border-white/70 bg-white/72 px-4 sm:px-5 lg:px-6 shadow-[0_20px_60px_rgba(37,99,235,0.14)] backdrop-blur-2xl">
          <div className="flex h-[70px] items-center justify-between gap-4">
            <button
              className="group flex shrink-0 items-center gap-3"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleNavigate("/")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow-sm transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md">
                O
              </div>
              <span className="flex flex-col leading-none text-left">
                <span className="text-display text-[16px] font-extrabold tracking-tight text-neutral-900 transition-colors duration-200 group-hover:text-brand-primary">
                  Objecto
                  <sup className="ml-0.5 align-super text-[8px] font-semibold tracking-normal">
                    TM
                  </sup>
                </span>
                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  OKR System
                </span>
              </span>
            </button>

            <nav className="hidden items-center gap-2 md:flex lg:gap-3">
              {primaryNavItems.map((item) => (
                <button
                  key={item.path}
                  className={navLinkClass(item.path)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {renderNavUnderline(item.path)}
                </button>
              ))}

              {smartMenuSections.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className={[
                      navLinkClass("/okr-workspace-level-1"),
                      "gap-2",
                    ].join(" ")}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setDropdownOpen((o) => !o)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                  >
                    <span className="relative z-10">Smart OKR Designer</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span
                      className={[
                        "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-200 ease-out",
                        dropdownOpen
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100",
                      ].join(" ")}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 top-full mt-3 w-[320px] overflow-hidden rounded-[24px] border border-white/70 bg-white/85 p-2 shadow-[0_22px_60px_rgba(37,99,235,0.16)] backdrop-blur-2xl animate-fade-slide-up">
                      <div className="max-h-[380px] space-y-3 overflow-y-auto px-1 pb-1 scrollbar-thin">
                        {smartMenuSections.map((section) => (
                          <div
                            key={section.title}
                            className="rounded-2xl bg-white/60 p-2"
                          >
                            <div className="mb-2 px-1 pt-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                                {section.title}
                              </p>
                            </div>
                            <div className="space-y-1">
                              {section.items.map(renderSmartItem)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-neutral-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-brand-primary hover:shadow-md md:hidden"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>

              {auth.isAuthenticated && auth.user?.empName ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setProfileMenuOpen((o) => !o)}
                    className="group flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/70 px-2 py-2 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    title={userName}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-500 to-cyan-400 text-[13px] font-medium text-white shadow-sm">
                      {profileInitial}
                    </div>
                    <div className="hidden min-w-0 flex-col md:flex">
                      <span className="truncate text-sm font-semibold leading-5 text-neutral-900">
                        {userName}
                      </span>
                      <span className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                        {userRoleLabel}
                      </span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-[300px] overflow-hidden rounded-[24px] border border-white/70 bg-white/98 p-2 shadow-[0_22px_60px_rgba(37,99,235,0.16)] backdrop-blur-2xl animate-fade-slide-up">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-bold text-white shadow-sm">
                            {profileInitial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {userName}
                            </p>
                            <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                              {userRoleLabel}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-neutral-500">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 py-2">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleNavigate("/my-profile")}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/70 hover:text-neutral-900"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block">My Profile</span>
                            <span className="block text-xs font-normal text-neutral-500">
                              View your account details and activity
                            </span>
                          </span>
                          <svg
                            className="h-4 w-4 text-neutral-300 transition-transform duration-200 group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={async () => {
                            closeMenus();
                            await auth.logout();
                            navigate("/login");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-danger transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-50/70"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-danger shadow-sm">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block">Sign out</span>
                            <span className="block text-xs font-normal text-neutral-500">
                              End your current session
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavigate("/login")}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            className="fixed right-3 top-[92px] z-50 w-[min(88vw,360px)] overflow-hidden rounded-[24px] border border-white/70 bg-white/98 p-2 shadow-[0_24px_70px_rgba(37,99,235,0.22)] backdrop-blur-2xl md:hidden animate-fade-slide-up"
          >
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Navigation
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-700">
                Quick access to the main sections
              </p>
            </div>

            <div className="space-y-1 py-2">
              {primaryNavItems.map((item) => (
                <button
                  key={item.path}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleNavigate(item.path)}
                  className={[
                    "flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ease-out",
                    isActive(item.path)
                      ? "bg-blue-50/80 text-brand-primary shadow-sm"
                      : "text-neutral-700 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-sm",
                  ].join(" ")}
                >
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm">
                    {item.label.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-neutral-900">
                      {item.label}
                    </span>
                    <span className="block text-xs leading-5 text-neutral-500">
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}

              {smartMenuSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl bg-white/65 p-2"
                >
                  <div className="px-2 pb-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {section.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                      {section.description}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.path}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleNavigate(item.path)}
                        className={[
                          "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ease-out",
                          isActive(item.path)
                            ? "bg-blue-50/80 text-brand-primary shadow-sm"
                            : "text-neutral-700 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-sm",
                        ].join(" ")}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-bold text-white shadow-sm">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-neutral-900">
                            {item.label}
                          </span>
                          <span className="block text-xs leading-5 text-neutral-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {auth.isAuthenticated && auth.user?.empName ? (
                <div className="rounded-2xl bg-white/65 p-2">
                  <div className="px-2 pb-2 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Profile
                    </p>
                  </div>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleNavigate("/my-profile")}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/75 hover:text-neutral-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm">
                      {profileInitial}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-neutral-900">
                        {userName}
                      </span>
                      <span className="block text-xs leading-5 text-neutral-500">
                        {userRoleLabel}
                      </span>
                    </span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={async () => {
                      closeMenus();
                      await auth.logout();
                      navigate("/login");
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-danger transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-50/70"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-danger shadow-sm">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">Sign out</span>
                      <span className="block text-xs leading-5 text-neutral-500">
                        End your current session
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  );
}
