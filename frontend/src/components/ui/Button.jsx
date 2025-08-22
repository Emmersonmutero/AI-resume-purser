import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn'; // We'll create this utility

const Button = forwardRef(({ 
  children, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  loadingText = null,
  className = '',
  type = 'button',
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95'
  ];

  const variants = {
    primary: [
      'bg-blue-600 text-white hover:bg-blue-700',
      'focus:ring-blue-500 shadow-sm hover:shadow-md'
    ],
    secondary: [
      'bg-gray-200 text-gray-900 hover:bg-gray-300',
      'focus:ring-gray-500 shadow-sm hover:shadow-md'
    ],
    success: [
      'bg-green-600 text-white hover:bg-green-700',
      'focus:ring-green-500 shadow-sm hover:shadow-md'
    ],
    danger: [
      'bg-red-600 text-white hover:bg-red-700',
      'focus:ring-red-500 shadow-sm hover:shadow-md'
    ],
    outline: [
      'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
      'focus:ring-gray-500 hover:border-gray-400'
    ],
    ghost: [
      'text-gray-700 hover:bg-gray-100',
      'focus:ring-gray-500'
    ],
    link: [
      'text-blue-600 hover:text-blue-700 hover:underline',
      'focus:ring-blue-500 p-0 h-auto'
    ]
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
    xl: 'px-8 py-4 text-xl h-14'
  };

  const classes = cn([
    ...baseClasses,
    ...variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  ]);

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const content = loading ? (
    <>
      <LoadingSpinner />
      {loadingText || children}
    </>
  ) : (
    <>
      {leftIcon && (
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
      {rightIcon && (
        <span className="ml-2 flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={classes}
      aria-busy={loading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

// Button variants as separate components for convenience
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const LinkButton = (props) => <Button variant="link" {...props} />;

export default Button;
