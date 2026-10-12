import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    const baseStyles = `
      w-full px-4 py-2.5 rounded-lg
      bg-white dark:bg-dark-card
      border border-gray-300 dark:border-dark-border
      text-gray-900 dark:text-dark-text
      placeholder:text-gray-400 dark:placeholder:text-dark-textTertiary
      focus:outline-none focus:ring-2 focus:ring-zerdeli-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
    `

    const errorStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : ''

    const withIconStyles = (leftIcon || rightIcon) ? 'flex items-center' : ''

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-textTertiary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                baseStyles,
                errorStyles,
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-textTertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-textTertiary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const baseStyles = `
      w-full px-4 py-2.5 rounded-lg
      bg-white dark:bg-dark-card
      border border-gray-300 dark:border-dark-border
      text-gray-900 dark:text-dark-text
      placeholder:text-gray-400 dark:placeholder:text-dark-textTertiary
      focus:outline-none focus:ring-2 focus:ring-zerdeli-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      resize-vertical min-h-[100px]
    `

    const errorStyles = error ? 'border-red-500 focus:ring-red-500' : ''

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={twMerge(clsx(baseStyles, errorStyles, className))}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-textTertiary">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
