import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const STATS = [
  { label: "Active OKRs", value: "1,240+", color: "text-brand-primary" },
  { label: "Org Levels", value: "7", color: "text-brand-accent" },
  { label: "Avg Completion", value: "87%", color: "text-success" },
  { label: "Quarters Tracked", value: "4", color: "text-warning" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Real-time Analytics",
    desc: "Track progress with live dashboards and performance graphs across all 7 organizational levels.",
    color: "bg-brand-light text-brand-primary",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Smart OKR Designer",
    desc: "Define objectives and key results with a guided, step-by-step stepper workflow for every level.",
    color: "bg-brand-accent-light text-brand-accent",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Hierarchy Alignment",
    desc: "Visualize how L1 objectives cascade down to L7, ensuring every team is aligned to the mission.",
    color: "bg-success-light text-success-text",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const userLevel = Number(auth.user?.empLevel || 1);
  const designerPath = auth.isAdmin
    ? "/okr-workspace-level-1"
    : `/okr-workspace-level-${Math.min(Math.max(userLevel, 1), 7)}`;
  const primaryAction = auth.isAuthenticated ? designerPath : "/login";
  const secondaryAction = auth.isAuthenticated ? "/okr-performance" : "/login";

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse-soft" />
            <div className="absolute top-10 right-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-25 animate-pulse-soft" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply blur-3xl opacity-30" />
          </div>

          <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: Headline */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-xl"
              >
                <Badge variant="blue" className="mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block" />
                  Goal alignment platform
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-neutral-900 leading-[1.15] mb-6">
                  Align goals,<br />
                  track outcomes,<br />
                  <span className="text-brand-primary">move faster.</span>
                </h1>

                <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-md">
                  Objecto helps leaders define priorities, connect teams to strategy, and review progress with precision across all 7 organizational levels.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" onClick={() => navigate(primaryAction)}>
                    {auth.isAuthenticated ? "Open Workspace" : "Get started free"}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate(secondaryAction)}>
                    {auth.isAuthenticated ? "View Performance" : "See how it works"}
                  </Button>
                </div>
              </motion.div>

              {/* Right: Preview card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow effect behind card */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-50 scale-95 translate-y-4" />

                <div className="relative bg-white rounded-2xl border-2 border-neutral-200 shadow-card-lg overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-0.5">Current Cycle</p>
                      <h2 className="text-lg font-bold text-neutral-900">Q2 OKR Command Center</h2>
                    </div>
                    <Badge variant="green">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      Live
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Progress section */}
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-neutral-700">Objective Health</span>
                        <span className="text-sm font-bold text-brand-primary">87% complete</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
                          initial={{ width: 0 }}
                          animate={{ width: '87%' }}
                          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">Improve customer adoption across core business units.</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "OKRs Active", value: "24" },
                        { label: "Levels", value: "7" },
                        { label: "Next Review", value: "Thu" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                          <div className="text-xl font-bold text-neutral-900">{stat.value}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Level indicators */}
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7].map(level => (
                        <div
                          key={level}
                          className={`flex-1 h-1.5 rounded-full ${level <= 4 ? 'bg-brand-primary' : level <= 6 ? 'bg-brand-accent' : 'bg-neutral-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400 text-center">7 levels of OKR alignment active</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {STATS.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border-2 border-neutral-200 shadow-card-md px-6 py-5 text-center">
                  <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-neutral-500 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white border-t border-neutral-100">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Everything you need to run OKRs</h2>
              <p className="text-neutral-500 max-w-lg mx-auto">From strategy to execution, Objecto covers the full OKR lifecycle for enterprise teams.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-6 rounded-2xl border-2 border-neutral-200 bg-white shadow-card hover:shadow-card-md hover:border-neutral-300 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
