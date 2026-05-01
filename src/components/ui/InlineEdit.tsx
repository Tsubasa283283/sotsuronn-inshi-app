'use client'

import { useState, useRef, useEffect } from 'react'

interface InlineEditProps {
  value: string
  onSave: (val: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
}

export default function InlineEdit({
  value,
  onSave,
  placeholder = '（未入力）',
  multiline = false,
  className = '',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  useEffect(() => {
    setDraft(value)
  }, [value])

  const commit = () => {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          className={`w-full border border-amber-400 px-2 py-1.5 text-sm text-slate-800 focus:outline-none resize-none bg-amber-50 ${className}`}
          rows={4}
        />
      )
    }
    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
        className={`w-full border border-amber-400 px-2 py-1 text-sm text-slate-800 focus:outline-none bg-amber-50 ${className}`}
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`cursor-text group relative px-2 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors ${className}`}
    >
      {value ? (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm text-slate-400 italic">{placeholder}</p>
      )}
      <span className="absolute top-1 right-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100">
        編集
      </span>
    </div>
  )
}
