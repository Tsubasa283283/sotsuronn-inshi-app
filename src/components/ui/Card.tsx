import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  accent?: boolean
}

export function CardHeader({ title, subtitle, action, accent = false }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 border-b border-slate-200 ${accent ? 'bg-slate-50' : ''}`}>
      <div>
        <h3 className="text-sm font-bold text-slate-800 tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
