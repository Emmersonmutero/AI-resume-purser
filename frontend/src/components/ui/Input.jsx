import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  required = false,
  disabled = false,
  placeholder = '',
  className = '',
  containerClassName = '',
  showPasswordToggle = false,
  onClear = null,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = [
    'block border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'placeholder:text-gray-400'
  ];

  const variants = {
    default: [
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    ],
    filled: [
      'bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20',
      error && 'bg-red-50 border-red-200 focus:border-red-500 focus:ring-red-500/20'
    ],
    outline: [
      'bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    ]
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const inputClasses = cn([
    ...baseClasses,
    ...variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    leftIcon && 'pl-10',
    (rightIcon || showPasswordToggle || onClear) && 'pr-10',
    className
  ].filter(Boolean));

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const PasswordToggleIcon = () => (
    <button
      type="button"
      onClick={handleTogglePassword}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      tabIndex={-1}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  const ClearButton = () => (
    <button
      type="button"
      onClick={handleClear}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      tabIndex={-1}
      aria-label="Clear input"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <div className={cn('space-y-1', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700',
            disabled && 'text-gray-500'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            cn(
              error && `${inputId}-error`,
              helperText && `${inputId}-helper`
            ) || undefined
          }
        />
        
        {type === 'password' && showPasswordToggle && <PasswordToggleIcon />}
        {onClear && props.value && <ClearButton />}
        {rightIcon && !showPasswordToggle && !onClear && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
