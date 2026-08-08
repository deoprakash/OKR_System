import React, { useEffect, useMemo, useRef, useState } from "react";

const baseSelectClass = [
  "w-full px-4 py-2.5 pr-10 text-sm font-medium text-neutral-900",
  "rounded-xl border border-neutral-300 bg-white shadow-sm",
  "appearance-none transition-all duration-200 ease-out",
  "focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
  "focus:border-brand-primary",
].join(" ");

const Select = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      className = "",
      containerClassName = "",
      children,
      ...props
    },
    ref,
  ) => {
    const { value, onChange, disabled, id, name, required, ...restProps } =
      props;
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const optionItems = useMemo(() => {
      return React.Children.toArray(children)
        .filter(
          (child) => React.isValidElement(child) && child.type === "option",
        )
        .map((child, index) => {
          const optionValue = child.props.value ?? "";
          const optionLabel = child.props.children;
          return {
            key: child.key ?? `${String(optionValue)}-${index}`,
            value: String(optionValue),
            label: optionLabel,
            disabled: Boolean(child.props.disabled),
          };
        });
    }, [children]);

    const selectedValue = value == null ? "" : String(value);
    const selectedOption =
      optionItems.find((option) => option.value === selectedValue) ||
      optionItems[0] ||
      null;

    useEffect(() => {
      function onOutsideClick(event) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(event.target)) {
          setOpen(false);
        }
      }

      function onEscape(event) {
        if (event.key === "Escape") setOpen(false);
      }

      document.addEventListener("mousedown", onOutsideClick);
      document.addEventListener("keydown", onEscape);

      return () => {
        document.removeEventListener("mousedown", onOutsideClick);
        document.removeEventListener("keydown", onEscape);
      };
    }, []);

    const handleSelect = (nextValue) => {
      if (!onChange) return;
      onChange({
        target: {
          value: nextValue,
          name,
        },
      });
      setOpen(false);
    };

    const menuButtonClass = [
      baseSelectClass,
      "text-left",
      error
        ? "border-danger focus:border-danger focus:ring-danger/20"
        : "hover:border-neutral-400 hover:shadow-md",
      disabled
        ? "cursor-not-allowed bg-neutral-50/85 text-neutral-500 shadow-none"
        : "cursor-pointer",
      className,
    ].join(" ");

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-semibold text-neutral-800 select-none mb-0.5 block">
            {label}
          </label>
        )}
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            id={id}
            name={name}
            ref={ref}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => {
              if (!disabled) setOpen((isOpen) => !isOpen);
            }}
            className={menuButtonClass}
            {...restProps}
          >
            <span
              className={
                selectedValue ? "text-neutral-900" : "text-neutral-500"
              }
            >
              {selectedOption?.label}
            </span>
          </button>

          {open && !disabled && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[24px] border border-white/70 bg-white/88 p-2 shadow-[0_22px_60px_rgba(37,99,235,0.32)] backdrop-blur-2xl animate-fade-slide-up">
              <div className="max-h-72 space-y-1 overflow-y-auto px-1 pb-1 scrollbar-thin">
                {optionItems.map((option) => {
                  const isSelected = selectedValue === option.value;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={option.disabled}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(option.value)}
                      className={[
                        "flex w-full items-center rounded-2xl px-3 py-2.5 text-left text-base transition-all duration-200 ease-out",
                        isSelected
                          ? "bg-blue-50/80 text-brand-primary shadow-sm"
                          : "text-neutral-700 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-sm",
                        option.disabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <input
            type="hidden"
            name={name}
            value={selectedValue}
            required={required}
            readOnly
          />
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
