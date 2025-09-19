import React from 'react';
import clsx from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  startAdornment,
  endAdornment,
  variant = 'outlined',
  size = 'medium',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = clsx(
    'input-base',
    {
      'input-outlined': variant === 'outlined',
      'input-filled': variant === 'filled',
      'input-standard': variant === 'standard',
      'input-small': size === 'small',
      'input-medium': size === 'medium',
      'input-large': size === 'large',
      'input-full-width': fullWidth,
      'input-error': !!error,
      'input-with-start-adornment': !!startAdornment,
      'input-with-end-adornment': !!endAdornment
    },
    className
  );

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <div className="input-adornment-wrapper">
        {startAdornment && (
          <div className="input-start-adornment">
            {startAdornment}
          </div>
        )}

        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />

        {endAdornment && (
          <div className="input-end-adornment">
            {endAdornment}
          </div>
        )}
      </div>

      {error && (
        <div className="input-error-text">
          {error}
        </div>
      )}

      {!error && helperText && (
        <div className="input-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;

