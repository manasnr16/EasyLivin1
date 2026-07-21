'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface SearchDropdownProps {
  label: string
  placeholder?: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
}

export default function SearchDropdown({
  label,
  placeholder = 'Any',
  options,
  value,
  onChange,
  icon,
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label ?? placeholder

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
          open
            ? 'bg-navy text-white'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        {icon && (
          <span className={`flex-shrink-0 ${open ? 'text-gold' : 'text-white/60'}`}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase leading-none mb-0.5 text-white/50">
            {label}
          </div>
          <div className={`text-[13px] font-medium truncate leading-tight ${
            value ? 'text-white' : 'text-white/55'
          }`}>
            {displayLabel}
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-white/50 transition-transform duration-200 ${open ? 'rotate-180 text-gold' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                  opt.value === value
                    ? 'bg-gold/10 text-navy font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
                  <Check size={13} className="text-gold flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
