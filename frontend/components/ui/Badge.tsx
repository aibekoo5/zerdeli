import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border'

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    success: 'badge-success',
    warning: 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300',
    info: 'badge-info'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  )
}
