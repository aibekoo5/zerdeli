import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zerdeli-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 hover:from-zerdeli-600 hover:to-zerdeli-700 text-slate-900 dark:text-white shadow-lg shadow-zerdeli-500/30 hover:shadow-xl hover:shadow-zerdeli-500/40 hover:-translate-y-0.5',
    secondary: 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-cardHover hover:border-zerdeli-500 dark:hover:border-zerdeli-500',
    ghost: 'bg-transparent hover:bg-zerdeli-50 dark:hover:bg-zerdeli-950 text-gray-700 dark:text-dark-text hover:text-zerdeli-600 dark:hover:text-zerdeli-400',
    outline: 'bg-transparent border-2 border-zerdeli-500 text-zerdeli-600 dark:text-zerdeli-400 hover:bg-zerdeli-50 dark:hover:bg-zerdeli-950'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
