import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export default function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-sm ${className}`}
    >
      {children}
    </span>
  )
}
