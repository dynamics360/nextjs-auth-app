'use client';

import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline';
  
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
    danger: 'bg-red-500 hover:bg-red-700 text-white'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isLoading || props.disabled}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 