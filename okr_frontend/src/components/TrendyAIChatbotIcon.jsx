import React from "react";

/**
 * Trendy, minimalist AI Chatbot icon with modern geometric chassis,
 * friendly sensor eyes, neural spark antenna, and subtle generative AI sparkle.
 */
export function TrendyAIChatbotIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Antenna / Signal Node */}
      <path
        d="M12 2V4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2" r="1.1" fill="currentColor" />

      {/* Modern Bot Head */}
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="14.5"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />

      {/* Side Sensors */}
      <path
        d="M1.75 10.5V13M22.25 10.5V13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="8.5" cy="11" r="1.35" fill="currentColor" />
      <circle cx="15.5" cy="11" r="1.35" fill="currentColor" />

      {/* Friendly Curve */}
      <path
        d="M9.75 14.8C10.4 15.4 11.2 15.65 12 15.65C12.8 15.65 13.6 15.4 14.25 14.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Trendy generative AI sparkle at top right */}
      <path
        d="M20.5 2L21.1 3.4L22.5 4L21.1 4.6L20.5 6L19.9 4.6L18.5 4L19.9 3.4L20.5 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Minimalist PDF export icon
 */
export function PDFExportIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
      <path d="M12 9v4" />
    </svg>
  );
}

export default TrendyAIChatbotIcon;
