import React from 'react';

const Stepper = ({ steps = [], currentStep = 0 }) => {
  return (
    <nav aria-label="Progress" className="px-1">
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isUpcoming = idx > currentStep;

          return (
            <li key={idx} className={`relative flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Step circle */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 border-2',
                    isCompleted
                      ? 'bg-brand-primary border-brand-primary text-white'
                      : isActive
                      ? 'bg-white border-brand-primary text-brand-primary shadow-focus'
                      : 'bg-white border-neutral-200 text-neutral-400',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={[
                      'text-sm font-semibold whitespace-nowrap',
                      isActive ? 'text-brand-primary' : isCompleted ? 'text-neutral-700' : 'text-neutral-400',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-brand-primary transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
