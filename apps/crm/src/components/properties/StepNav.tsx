'use client'

import { Check, Lock } from 'lucide-react'
import { STEPS, type StepKey } from './formTypes'

interface StepNavProps {
  active: StepKey
  completed: Set<StepKey>
  unlockedIndex: number
  onSelect: (key: StepKey) => void
}

// Horizontal on desktop/tablet — a numbered rail, not a dominant visual
// element. Steps beyond unlockedIndex are locked (greyed out, not
// clickable) — the wizard only lets a staff member reach a step once the
// one before it is fully filled in; a check mark shows what's done.
export default function StepNav({ active, completed, unlockedIndex, onSelect }: StepNavProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === active)

  return (
    <div className="border-b border-slate-200 mb-6">
      <div className="flex items-center overflow-x-auto">
        {STEPS.map((step, i) => {
          const isActive = step.key === active
          const isDone = completed.has(step.key)
          const isLocked = i > unlockedIndex
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect(step.key)}
              disabled={isLocked}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-navy'
                  : isLocked
                    ? 'border-transparent text-slate-300 cursor-not-allowed'
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
                {isLocked ? <Lock size={9} /> : isDone && !isActive ? <Check size={11} /> : i + 1}
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
