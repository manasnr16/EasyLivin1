'use client'

import { Check } from 'lucide-react'
import { STEPS, type StepKey } from './formTypes'

interface StepNavProps {
  active: StepKey
  completed: Set<StepKey>
  onSelect: (key: StepKey) => void
}

// Horizontal on desktop/tablet — a numbered rail, not a dominant visual
// element. Every step is clickable (no forced linear flow); a check mark
// just tells staff what they've already filled in, it never blocks access.
export default function StepNav({ active, completed, onSelect }: StepNavProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === active)

  return (
    <div className="border-b border-slate-200 mb-6">
      <div className="flex items-center overflow-x-auto">
        {STEPS.map((step, i) => {
          const isActive = step.key === active
          const isDone = completed.has(step.key)
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect(step.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-navy'
                  : 'border-transparent text-slate-400 hover:text-navy'
              }`}
            >
              <span
                className={`rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive
                    ? 'bg-gold text-white'
                    : isDone
                      ? 'bg-navy/10 text-navy'
                      : 'bg-slate-100 text-slate-400'
                }`}
                style={{ width: 18, height: 18 }}
              >
                {isDone && !isActive ? <Check size={11} /> : i + 1}
              </span>
              {step.label}
            </button>
          )
        })}
      </div>
      {/* Compact fallback readable at a glance on narrower widths, sits under the tabs */}
      <p className="text-[11px] text-slate-400 pb-2 sm:hidden">
        Step {activeIndex + 1} of {STEPS.length} — {STEPS[activeIndex]!.label}
      </p>
    </div>
  )
}
