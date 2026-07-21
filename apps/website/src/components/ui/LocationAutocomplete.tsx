'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin } from 'lucide-react'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  suggestions: string[]
  labelText?: string
  inputClassName?: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search area, landmark...',
  suggestions,
  labelText,
  inputClassName = '',
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const filtered = value.trim().length >= 1
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : []

  // Always position below the input
  function updatePosition() {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 244),
      minWidth: Math.max(220, rect.width),
      zIndex: 9999,
    })
  }

  useEffect(() => {
    if (open) updatePosition()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value, filtered.length])

  // Close when the page scrolls so the dropdown doesn't float away from the input
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
      if (!open && filtered.length > 0) setOpen(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Enter') {
      if (open && highlighted >= 0 && filtered[highlighted]) {
        onChange(filtered[highlighted])
        setOpen(false)
        setHighlighted(-1)
      } else {
        onSubmit?.()
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const showDropdown = mounted && open && filtered.length > 0

  return (
    <>
      {labelText && (
        <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-0.5 leading-none">
          {labelText}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(e.target.value.trim().length >= 1)
          setHighlighted(-1)
        }}
        onFocus={() => {
          if (value.trim().length >= 1 && filtered.length > 0) {
            updatePosition()
            setOpen(true)
          }
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />
      {showDropdown &&
        createPortal(
          <div
            style={dropdownStyle}
            className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
            // Stop wheel events from reaching the page scroll handler
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="max-h-[280px] overflow-y-auto">
              {filtered.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(s)
                    setOpen(false)
                    setHighlighted(-1)
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors ${
                    i === highlighted
                      ? 'bg-gold/10 text-navy font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy'
                  }`}
                >
                  <MapPin size={12} className="text-gold flex-shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
