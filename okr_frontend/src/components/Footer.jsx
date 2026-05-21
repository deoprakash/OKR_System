import React from "react";

export default function Footer() {
  return (
    <footer className="footer-shell w-full py-6 mt-auto text-center">
      <div className="container mx-auto px-4 text-sm text-(--muted)">
        <span className="brand-text footer-brand">Objecto<span className="tm">™</span></span>
        <span className="sr-only">Objecto</span>
        &nbsp;&copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </div>
    </footer>
  );
}
