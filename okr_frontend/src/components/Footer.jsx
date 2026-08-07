import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-white/50 bg-white/55 backdrop-blur-xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="font-semibold text-neutral-800">
              Objecto<sup className="text-[9px] text-brand-primary">™</sup>
            </span>
            <span className="text-neutral-300">·</span>
            <span>&copy; {year} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Support"].map((link) => (
              <button
                key={link}
                className="text-xs text-neutral-500 hover:text-brand-primary transition-colors font-medium"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
