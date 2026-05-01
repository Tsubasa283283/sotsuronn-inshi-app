'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'ホーム',
    href: '/',
    icon: '🏠',
  },
  {
    label: '卒論',
    href: '/thesis',
    icon: '📝',
  },
  {
    label: '院試対策',
    href: '/exam',
    icon: '🎯',
  },
  {
    label: '志望校',
    icon: '🏫',
    children: [
      { label: '青山学院', href: '/schools/aoyama' },
      { label: '明治', href: '/schools/meiji' },
      { label: '千葉商科', href: '/schools/chiba-shoka' },
    ],
  },
  {
    label: '共通素材庫',
    href: '/materials',
    icon: '📚',
  },
  {
    label: '参考リンク集',
    href: '/links',
    icon: '🔗',
  },
  {
    label: 'ゼミ報告生成',
    href: '/report',
    icon: '📄',
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href
  const isParentActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href)

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-slate-900 text-slate-100 flex flex-col z-50">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-700">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">
          研究・院試管理
        </p>
        <h1 className="text-sm font-bold text-white leading-tight">
          卒論 &amp; 院試<br />管理システム
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          if (item.children) {
            const active = isParentActive(item.children)
            return (
              <div key={item.label}>
                <div
                  className={`flex items-center gap-2.5 px-5 py-2 text-xs font-semibold tracking-wide uppercase ${
                    active ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center pl-10 pr-5 py-2 text-sm transition-colors ${
                      isActive(child.href)
                        ? 'bg-slate-700 text-white font-medium border-l-2 border-amber-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                isActive(item.href!)
                  ? 'bg-slate-700 text-white font-medium border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700">
        <p className="text-[10px] text-slate-500">データはローカル保存</p>
      </div>
    </aside>
  )
}
