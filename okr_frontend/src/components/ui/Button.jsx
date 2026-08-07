import React from "react";

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

const variantClasses = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-hover active:bg-blue-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  secondary:
    "bg-white/70 text-neutral-700 border border-white/60 backdrop-blur-xl hover:bg-white/85 hover:border-white/80 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-2",
  danger:
    "bg-danger text-white hover:bg-danger-text active:bg-red-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-white/60 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25 focus-visible:ring-offset-2",
  outline:
    "bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  onMouseDown,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Prevent focus shift on click — merges with any caller-supplied onMouseDown
  const handleMouseDown = (e) => {
    e.preventDefault();
    onMouseDown?.(e);
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onMouseDown={handleMouseDown}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none whitespace-nowrap",
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "active:scale-[0.97] cursor-pointer",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
