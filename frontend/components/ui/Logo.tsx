import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

interface LogoProps {
  variant?: 'default' | 'white' | 'dark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { px: 34, text: 'text-lg', sub: 'text-[10px]' },
  md: { px: 44, text: 'text-xl', sub: 'text-[11px]' },
  lg: { px: 54, text: 'text-2xl', sub: 'text-xs' },
  xl: { px: 76, text: 'text-3xl', sub: 'text-sm' },
}

export function Logo({ variant = 'default', size = 'md', showText = true, className }: LogoProps) {
  const { px, text, sub } = sizes[size]

  const textColor = variant === 'white' ? 'text-white' : 'text-slate-900'
  const subColor = variant === 'white' ? 'text-white/70' : 'text-slate-500'

  return (
    <div className={twMerge(clsx('flex items-center gap-2.5', className))}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zerdeli-logo.jpg"
        alt="Zerdeli Education"
        width={px}
        height={px}
        className="flex-shrink-0 rounded-full bg-white object-cover ring-1 ring-slate-200/70 shadow-sm"
        style={{ width: px, height: px }}
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={clsx('font-extrabold tracking-tight', text, textColor)}>Zerdeli</span>
          <span className={clsx('font-medium tracking-wide mt-0.5', sub, subColor)}>
            Education · Ұзынағаш
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ size = 'md', variant = 'default', className }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} variant={variant} showText={false} className={className} />
}
