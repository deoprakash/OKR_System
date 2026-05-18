
import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const highlights = [
  { value: "92%", label: "Objectives on track", desc: "See progress across teams in one live view." },
  { value: "4.8x", label: "Faster alignment", desc: "Cascade company goals into team and individual OKRs." },
  { value: "1,200+", label: "Key results tracked", desc: "Monitor confidence, ownership, and weekly reviews." },
];

const pillars = [
  { title: "Set direction", text: "Translate strategy into measurable outcomes and visible priorities." },
  { title: "Cascade clearly", text: "Align every department, team, and employee with a shared focus." },
  { title: "Review weekly", text: "Track signals, update confidence, and remove blockers early." },
  { title: "Adjust fast", text: "Use performance data to refine plans without losing momentum." },
];

const features = [
  "Live objective health and key result tracking",
  "Role-based OKR workspaces for levels 1–7",
  "Weekly check-ins, confidence scoring, and comment history",
  "Visibility for managers, admins, and cross-functional teams",
  "Performance analytics that surface progress and risk",
  "A clean workflow for planning, reviewing, and closing cycles",
];

const cycleSteps = [
  { step: "01", title: "Plan", text: "Define clear objectives with measurable results and owners." },
  { step: "02", title: "Cascade", text: "Distribute goals through leadership, departments, and contributors." },
  { step: "03", title: "Track", text: "Update progress, comments, and confidence scores each week." },
  { step: "04", title: "Improve", text: "Learn from outcomes and roll insights into the next cycle." },
];

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const userLevel = Number(auth.user?.empLevel || 1);

  const designerPath = auth.isAdmin
    ? "/okr-workspace-level-1"
    : `/okr-workspace-level-${Math.min(Math.max(userLevel, 1), 7)}`;

  const primaryAction = auth.isAuthenticated ? designerPath : "/login";
  const secondaryAction = auth.isAuthenticated ? "/okr-performance" : "#okr-flow";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NavBar />
      <main className="flex-1">
        <section className="hero-shell section shift-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="rise-in">
                <div className="hero-badge mb-6">
                  <span className="badge-dot" />
                  Goal alignment platform
                </div>

                <h1 className="hero-title">
                  Align goals,
                  <br />
                  track outcomes,
                  <br />
                  move faster.
                </h1>

                <p className="hero-copy mt-6">
                  OKR System helps leaders define priorities, connect teams to strategy, and review progress with precision.
                  Build clear objectives, measurable key results, and a cadence that keeps every cycle visible.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button className="hero-primary" onClick={() => navigate(primaryAction)}>
                    {auth.isAuthenticated ? "Open workspace" : "Get started"}
                  </button>
                  <a className="hero-secondary inline-flex items-center justify-center" href={secondaryAction}>
                    {auth.isAuthenticated ? "View performance" : "Explore OKR flow"}
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-3 text-sm text-(--muted)">
                  <span className="info-pill">Strategic planning</span>
                  <span className="info-pill">Weekly reviews</span>
                  <span className="info-pill">Team visibility</span>
                  <span className="info-pill">Outcome-driven execution</span>
                </div>
              </div>

              <div className="relative">
                <div className="floating-orb w-40 h-40 -top-6 -left-8" />
                <div className="floating-orb w-28 h-28 top-16 right-4" style={{ animationDelay: '1.3s' }} />

                <div className="hero-panel p-5 sm:p-6 lg:p-8 relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="metric-label">Current cycle</p>
                      <h2 className="mt-2 text-2xl font-bold">Q2 OKR command center</h2>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.24em] text-(--accent)">
                      Live
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="preview-card p-4 pulse-soft">
                      <div className="flex items-center justify-between mb-3">
                        <span className="info-pill">Objective health</span>
                        <span className="text-xs text-(--muted)">87% complete</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-[87%] rounded-full bg-linear-to-r from-cyan-400 to-blue-500" />
                      </div>
                      <p className="mt-4 text-sm">Priority objective: improve customer adoption across core business units.</p>
                    </div>

                    <div className="preview-card p-4">
                      <p className="metric-label mb-2">Next review</p>
                      <div className="text-3xl font-bold text-white">Thursday</div>
                      <p className="mt-2 text-sm">Weekly check-ins with owners, blockers, and confidence updates.</p>
                    </div>

                    <div className="preview-card p-4 sm:col-span-2">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="metric-label">Example key results</p>
                          <h3 className="mt-2 text-xl font-semibold">Quarterly target dashboard</h3>
                        </div>
                        <span className="info-pill">Aligned</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          ["Increase active users", "76%"],
                          ["Ship release milestones", "62%"],
                          ["Improve NPS", "+12"],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                            <div className="text-sm text-(--muted)">{label}</div>
                            <div className="mt-2 text-2xl font-bold text-white">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item, index) => (
                <article key={item.label} className="metric-card p-6 rise-in" style={{ animationDelay: `${index * 120}ms` }}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="metric-label">REF. 0{index + 1}</span>
                    <span className="w-3 h-3 rounded-full bg-cyan-400/80" />
                  </div>
                  <div className="metric-value">{item.value}</div>
                  <h3 className="mt-3 text-lg font-semibold uppercase tracking-wide text-white/90">{item.label}</h3>
                  <p className="mt-3 text-sm leading-7">{item.desc}</p>
                  <div className="mt-6 h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500" style={{ width: `${72 + index * 7}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="okr-flow" className="section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <p className="hero-badge mb-4">OKR operating model</p>
              <h2 className="section-heading">A clear system for planning, tracking, and improving</h2>
              <p className="section-subtitle mt-4">
                The home screen now explains the workflow visually: strategy becomes measurable objectives,
                objectives become key results, and weekly reviews keep delivery focused.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {pillars.map((item, index) => (
                <div key={item.title} className="step-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="info-pill">0{index + 1}</span>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] items-start">
              <div>
                <p className="hero-badge mb-4">Why it works</p>
                <h2 className="section-heading">Everything leaders need to keep OKRs visible</h2>
                <p className="section-subtitle mt-4">
                  Reduce ambiguity, create consistent review habits, and make progress easier to understand across the organization.
                </p>

                <div className="mt-6 space-y-4">
                  {features.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/7 bg-white/3 p-4">
                      <span className="mt-1 badge-dot" />
                      <span className="text-sm leading-7 text-(--text)">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {cycleSteps.map((item, index) => (
                  <article key={item.title} className="feature-card p-6 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500" />
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs uppercase tracking-[0.28em] text-(--muted)">Step {item.step}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7">{item.text}</p>
                    <div className="mt-6 h-28 rounded-2xl border border-white/7 bg-linear-to-br from-cyan-400/10 to-transparent flex items-end p-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-xs text-(--muted) mb-2">
                          <span>Momentum</span>
                          <span>{70 + index * 6}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                          <div className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500" style={{ width: `${70 + index * 6}%` }} />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hero-panel p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="hero-badge mb-4">Ready to align your team?</p>
                <h2 className="section-heading">Make OKRs visible, actionable, and easy to review</h2>
                <p className="section-subtitle mt-4">
                  Start with one cycle, connect every level, and build a rhythm that turns goals into measurable delivery.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="hero-primary" onClick={() => navigate(primaryAction)}>
                  {auth.isAuthenticated ? "Open workspace" : "Login now"}
                </button>
                <button className="hero-secondary" onClick={() => navigate("/okr-performance")}>See performance</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
