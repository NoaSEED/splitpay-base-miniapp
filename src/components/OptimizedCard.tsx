import React from 'react'

// ===========================================
// Types
// ===========================================

interface OptimizedCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
  onClick?: () => void
}

// ===========================================
// Optimized Card Component
// ===========================================

export const OptimizedCard: React.FC<OptimizedCardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick
}) => {
  // Base classes
  const baseClasses = "rounded-lg bg-white"
  
  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8"
  }
  
  // Shadow classes
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg"
  }
  
  // Border classes
  const borderClasses = border ? "border border-gray-200" : ""
  
  // Hover classes
  const hoverClasses = hover ? "hover:shadow-md transition-shadow cursor-pointer" : ""
  
  const cardClasses = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${hoverClasses} ${className}`

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}


