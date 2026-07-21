'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Share2, MessageCircle } from 'lucide-react'
import SocialChannelsPanel from '@/components/automation/SocialChannelsPanel'
import WhatsAppAutomationPanel from '@/components/automation/WhatsAppAutomationPanel'
import clsx from 'clsx'

type Tab = 'social' | 'whatsapp'

export default function AutomationPage() {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState<Tab>('social')

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Automation" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Admin access only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Automation" subtitle="Social media auto-posting and WhatsApp automation configuration" />

      <div className="flex-1 p-6 max-w-[800px] mx-auto w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-[13px] text-amber-700">
          <strong>Preview only:</strong> this screen shows how social media and WhatsApp automation will be configured once the client sets up the underlying accounts. Nothing here is connected to a real network yet — toggles and templates are not saved.
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-slate-200 mb-6">
          <button
            onClick={() => setTab('social')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors',
              tab === 'social' ? 'border-gold text-gold' : 'border-transparent text-slate-500 hover:text-navy'
            )}
          >
            <Share2 size={14} /> Social Media
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors',
              tab === 'whatsapp' ? 'border-gold text-gold' : 'border-transparent text-slate-500 hover:text-navy'
            )}
          >
            <MessageCircle size={14} /> WhatsApp Automation
          </button>
        </div>

        {tab === 'social' ? <SocialChannelsPanel /> : <WhatsAppAutomationPanel />}
      </div>
    </div>
  )
}
