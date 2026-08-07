import React from "react";

const Card = ({
  children,
  className = "",
  title,
  elevated = false,
  ...props
}) => {
  const base = "glass-card rounded-2xl";
  const shadow = elevated ? "shadow-card-md" : "shadow-card";

  return (
    <div
      data-reveal
      className={`${base} scroll-reveal ${shadow} ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-white/50">
          <h2 className="text-base font-semibold text-neutral-900 text-display">
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
