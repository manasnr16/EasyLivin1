'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import clsx from 'clsx'

interface Rule {
  id: string
  label: string
  desc: string
  defaultTemplate: string
}

const RULES: Rule[] = [
  { id: 'new-lead-agent', label: 'New lead pings the agent', desc: 'Sends the assigned agent a WhatsApp alert the moment a lead comes in', defaultTemplate: 'New lead: {{leadName}} ({{leadPhone}}) interested in {{propertyTitle}}. Respond quickly!' },
  { id: 'new-lead-brochure', label: 'New lead sends a brochure link', desc: 'Sends the buyer a WhatsApp message with a brochure/property link', defaultTemplate: 'Hi {{leadName}}, thanks for your interest in {{propertyTitle}}! Here\'s the brochure: {{brochureLink}}' },
  { id: 'idle-follow-up', label: 'Idle-lead follow-up', desc: 'Nudges a lead that has not been contacted in 3+ days', defaultTemplate: 'Hi {{leadName}}, just checking in — are you still looking for a property in {{village}}?' },
  { id: 'sold-notification', label: 'Sold-property notification', desc: 'Notifies interested leads when a property they enquired about is sold', defaultTemplate: '{{propertyTitle}} has just been sold. Let us know if you\'d like similar recommendations!' },
]

export default function WhatsAppAutomationPanel() {
  const [provider, setProvider] = useState('Meta Cloud API')
  const [connectedNumber, setConnectedNumber] = useState('')
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const [templates, setTemplates] = useState<Record<string, string>>({})

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-navy">WhatsApp Business Number</p>
            <span className="badge badge-draft">Not Connected</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="crm-label">Provider</label>
            <select className="crm-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option>Meta Cloud API</option>
              <option>Twilio</option>
              <option>Gupshup</option>
              <option>Interakt</option>
              <option>WATI</option>
            </select>
          </div>
          <div>
            <label className="crm-label">WhatsApp Number</label>
            <input className="crm-input" value={connectedNumber} onChange={(e) => setConnectedNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>
      </div>

      {RULES.map((rule) => {
        const isEnabled = !!enabled[rule.id]
        return (
          <div key={rule.id} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-slate-700">{rule.label}</p>
                <p className="text-[11px] text-slate-400">{rule.desc}</p>
              </div>
              <button
                onClick={() => setEnabled((e) => ({ ...e, [rule.id]: !e[rule.id] }))}
                className={clsx('w-10 h-5 rounded-full transition-all relative flex-shrink-0', isEnabled ? 'bg-gold' : 'bg-slate-200')}
              >
                <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', isEnabled ? 'left-5' : 'left-0.5')} />
              </button>
            </div>
            {isEnabled && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="crm-label">Message Template</label>
                <textarea
                  className="crm-input resize-none"
                  rows={2}
                  value={templates[rule.id] ?? ''}
                  onChange={(e) => setTemplates((t) => ({ ...t, [rule.id]: e.target.value }))}
                  placeholder={rule.defaultTemplate}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
