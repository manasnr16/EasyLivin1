'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  error?: boolean
  className?: string
  emptyText?: string
}

// Custom listbox instead of a native <select> — a native select's open
// popup is positioned entirely by the browser/OS (it flips above the
// trigger when there isn't room below, and can shift as the page scrolls
// or the viewport resizes). This version is always anchored to the
// trigger's bottom edge and never flips, which a native select can't do.
export default function Dropdown({ value, onChange, options, placeholder = 'Select...', error, className, emptyText = 'No options' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div className={clsx('relative', className)} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'crm-select flex items-center justify-between gap-2 text-left',
          error && 'border-red-400'
        )}
      >
        <span className={clsx('truncate', selected ? 'text-slate-800' : 'text-slate-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className={clsx('text-slate-400 flex-shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1"
        >
          {options.length === 0 && (
            <p className="px-3.5 py-2 text-[13px] text-slate-400">{emptyText}</p>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full text-left px-3.5 py-2 text-[13.5px] transition-colors',
                o.value === value ? 'bg-gold text-white font-medium' : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
