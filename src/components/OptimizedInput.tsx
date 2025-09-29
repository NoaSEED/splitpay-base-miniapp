import React, { forwardRef } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

// ===========================================
// Types
// ===========================================

interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

// ===========================================
// Optimized Input Component
// ===========================================

export const OptimizedInput = forwardRef<HTMLInputElement, OptimizedInputProps>(
  ({ 
    label, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    containerClassName = '',
    className = '',
    ...props 
  }, ref) => {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    const errorClasses = error ? 'border-red-500' : ''
    const successClasses = success ? 'border-green-500' : ''
    const defaultClasses = !error && !success ? 'border-gray-300' : ''
    const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''

    const inputClasses = `${baseClasses} ${errorClasses} ${successClasses} ${defaultClasses} ${disabledClasses} ${className}`

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">{leftIcon}</div>
            </div>
          )}
          
          <input
            ref={ref}
            className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon || error || success ? 'pr-10' : ''}`}
            {...props}
          />
          
          {(rightIcon || error || success) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {error && <AlertCircle className="w-4 h-4 text-red-500" />}
              {success && <CheckCircle className="w-4 h-4 text-green-500" />}
              {!error && !success && rightIcon && (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)

OptimizedInput.displayName = 'OptimizedInput'




