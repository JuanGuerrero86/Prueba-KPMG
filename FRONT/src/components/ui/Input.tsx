import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, rightIcon, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          id={id}
          className={`w-full border rounded px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
