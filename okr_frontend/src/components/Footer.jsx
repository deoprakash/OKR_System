import React from "react";

export default function Footer() {
  return (
    <footer className="w-full text-white py-4 mt-auto bg-blue-900/80 backdrop-blur-sm border-t border-blue-300/25 shadow text-center">
      <div className="container mx-auto">
        <span className="font-semibold">OKR System</span> &copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </div>
    </footer>
  );
}
