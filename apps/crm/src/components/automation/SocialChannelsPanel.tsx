'use client'

import { useState } from 'react'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import clsx from 'clsx'

interface Channel {
  id: string
  label: string
  icon: React.ElementType
  placeholder: string
}

const CHANNELS: Channel[] = [
  { id: 'facebook', label: 'Facebook Page', icon: Facebook, placeholder: 'New listing alert! 🏡 {{title}} in {{village}} — {{price}}. DM us to schedule a visit!' },
  { id: 'instagram', label: 'Instagram Business', icon: Instagram, placeholder: 'Just listed ✨ {{title}} — {{price}}. Link in bio for details.' },
  { id: 'linkedin', label: 'LinkedIn Company Page', icon: Linkedin, placeholder: 'New property now available: {{title}}, {{village}}. Contact us for details.' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Walkthrough video coming soon for {{title}}.' },
]

export default function SocialChannelsPanel() {
  const [connected, setConnected] = useState<Record<string, boolean>>({})
  const [captions, setCaptions] = useState<Record<string, string>>({})

  return (
    <div className="space-y-4">
      {CHANNELS.map((channel) => {
        const Icon = channel.icon
        const isConnected = !!connected[channel.id]
        return (
          <div key={channel.id} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-[160px]">
                <p className="text-[14px] font-semibold text-navy">{channel.label}</p>
                <p className="text-[12px] text-slate-400">Auto-post new listings to this channel</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={clsx('badge', isConnected ? 'badge-published' : 'badge-draft')}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                <button
                  onClick={() => setConnected((c) => ({ ...c, [channel.id]: !c[channel.id] }))}
                  className={clsx('text-[11px] py-1.5 px-3 rounded-lg border font-semibold transition-all',
                    isConnected ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-gold/40 text-gold hover:bg-gold/10'
                  )}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="crm-label">Caption Template</label>
              <textarea
                className="crm-input resize-none"
                rows={2}
                value={captions[channel.id] ?? ''}
                onChange={(e) => setCaptions((c) => ({ ...c, [channel.id]: e.target.value }))}
                placeholder={channel.placeholder}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
