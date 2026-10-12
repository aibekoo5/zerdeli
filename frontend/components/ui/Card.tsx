import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glass?: boolean
}

export function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  glass = false
}: CardProps) {
  const baseStyles = 'rounded-xl border transition-all duration-300'

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const cardStyles = glass
    ? 'glass-card'
    : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border shadow-sm'

  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-1 hover:border-zerdeli-500 dark:hover:border-zerdeli-500 cursor-pointer'
    : ''

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          cardStyles,
          paddingStyles[padding],
          hoverStyles,
          className
        )
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={twMerge('text-xl font-bold text-gray-900 dark:text-dark-text', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={twMerge('text-sm text-gray-600 dark:text-dark-textSecondary mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge(className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge('mt-6 pt-4 border-t border-gray-200 dark:border-dark-border', className)}>
      {children}
    </div>
  )
}
