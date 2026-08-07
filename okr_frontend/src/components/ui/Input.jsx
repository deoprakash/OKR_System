import React from "react";

const Input = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      className = "",
      containerClassName = "",
      type = "text",
      readOnly = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-semibold text-neutral-800 select-none mb-0.5 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          readOnly={readOnly}
          className={[
            "w-full px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder-neutral-400",
            "bg-white border border-neutral-300 shadow-sm rounded-xl transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary",
            error
              ? "border-danger focus:ring-danger/20 focus:border-danger"
              : "hover:border-neutral-400",
            readOnly ? "bg-neutral-50 cursor-default text-neutral-600" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
