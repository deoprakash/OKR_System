
import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const userLevel = Number(auth.user?.empLevel || 1);

  const designerPath = auth.isAdmin
    ? "/okr-workspace-level-1"
    : `/okr-workspace-level-${Math.min(Math.max(userLevel, 1), 7)}`;

  return (
    <div className="min-h-screen bg-[#0f1724] flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-blue-glow-lg p-10 max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to OKR System</h1>
          <div className="flex gap-4 justify-center flex-wrap">
            {auth.isAuthenticated ? (
              <>
                <button
                  className="mt-4 px-6 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow-blue-glow hover:bg-blue-600 transition"
                  onClick={() => navigate(designerPath)}
                >
                  Smart OKR Designer
                </button>
                <button
                  className="mt-4 px-6 py-2 rounded-xl bg-green-500 text-white font-semibold shadow-blue-glow hover:bg-green-600 transition"
                  onClick={() => navigate("/okr-performance")}
                >
                  View OKR Performance
                </button>
              </>
            ) : (
              <p className="mt-4 text-slate-700 font-medium">Use the Login button in the top-right navbar to continue.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
