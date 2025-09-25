import React, { useState, ReactNode } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants'

// ===========================================
// Types
// ===========================================

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface FormFieldProps {
  label: string
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  validation?: ValidationRule
  options?: { value: string; label: string }[]
  disabled?: boolean
  className?: string
}

interface FormValidationProps {
  children: ReactNode
  onSubmit: (data: Record<string, string>) => void
  initialData?: Record<string, string>
  validationRules?: Record<string, ValidationRule>
  isSubmitting?: boolean
}

// ===========================================
// Form Field Component
// ===========================================

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  validation,
  options,
  disabled = false,
  className = ''
}) => {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validate = (val: string): string | null => {
    if (!validation) return null

    if (validation.required && !val.trim()) {
      return 'Este campo es requerido'
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `Mínimo ${validation.minLength} caracteres`
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `Máximo ${validation.maxLength} caracteres`
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return 'Formato inválido'
    }

    if (validation.custom) {
      return validation.custom(val)
    }

    return null
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    if (touched) {
      setError(validate(newValue))
    }
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validate(value))
  }

  const isValid = !error && touched && value.trim()

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">{placeholder || 'Seleccionar...'}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      )}

      {error && touched && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isValid && (
        <div className="flex items-center space-x-1 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Válido</span>
        </div>
      )}
    </div>
  )
}

// ===========================================
// Form Validation Component
// ===========================================

export const FormValidation: React.FC<FormValidationProps> = ({
  children,
  onSubmit,
  initialData = {},
  validationRules = {},
  isSubmitting: externalIsSubmitting = false
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  
  const isSubmitting = externalIsSubmitting || internalIsSubmitting
  
  // Use isSubmitting to prevent form submission during loading
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    if (!validate()) {
      return
    }

    setInternalIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    Object.entries(validationRules).forEach(([field, rule]) => {
      const value = formData[field] || ''

      if (rule.required && !value.trim()) {
        newErrors[field] = 'Este campo es requerido'
        return
      }

      if (rule.minLength && value.length < rule.minLength) {
        newErrors[field] = `Mínimo ${rule.minLength} caracteres`
        return
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = `Máximo ${rule.maxLength} caracteres`
        return
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = 'Formato inválido'
        return
      }

      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) {
          newErrors[field] = customError
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === FormField) {
          return React.cloneElement(child, {
            value: formData[child.props.name] || '',
            onChange: (value: string) => updateField(child.props.name, value),
            error: errors[child.props.name]
          } as any)
        }
        return child
      })}
    </form>
  )
}

// ===========================================
// Predefined Validation Rules
// ===========================================

export const VALIDATION_RULES = {
  required: { required: true },
  groupName: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.GROUP_NAME
  },
  description: {
    maxLength: 200
  },
  ethAddress: {
    required: true,
    pattern: VALIDATION_PATTERNS.ETH_ADDRESS,
    custom: (value: string) => {
      if (!VALIDATION_PATTERNS.ETH_ADDRESS.test(value)) {
        return ERROR_MESSAGES.INVALID_ADDRESS
      }
      return null
    }
  },
  amount: {
    required: true,
    pattern: VALIDATION_PATTERNS.AMOUNT,
    custom: (value: string) => {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue <= 0) {
        return ERROR_MESSAGES.INVALID_EXPENSE_AMOUNT
      }
      if (numValue > 10000) {
        return 'El monto no puede ser mayor a $10,000'
      }
      return null
    }
  }
}

// ===========================================
// Custom Hooks
// ===========================================

export const useFormValidation = (initialData: Record<string, string> = {}) => {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateField = (field: string, rules: ValidationRule) => {
    const value = data[field] || ''
    let error: string | null = null

    if (rules.required && !value.trim()) {
      error = 'Este campo es requerido'
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `Mínimo ${rules.minLength} caracteres`
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `Máximo ${rules.maxLength} caracteres`
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = 'Formato inválido'
    } else if (rules.custom) {
      error = rules.custom(value)
    }

    setErrors(prev => ({ ...prev, [field]: error || '' }))
    return !error
  }

  const validateAll = (rules: Record<string, ValidationRule>) => {
    let isValid = true

    Object.entries(rules).forEach(([field, rule]) => {
      const fieldValid = validateField(field, rule)
      if (!fieldValid) {
        isValid = false
      }
    })

    return isValid
  }

  return {
    data,
    errors,
    updateField,
    validateField,
    validateAll,
    setData,
    setErrors
  }
}
