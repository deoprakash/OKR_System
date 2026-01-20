import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-blue-700 text-white py-4 mt-auto shadow-blue-glow text-center">
      <div className="container mx-auto">
        <span className="font-semibold">OKR System</span> &copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </div>
    </footer>
  );
}
