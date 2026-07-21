import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, Eye, TrendingUp } from 'lucide-react'
import { LOCATIONS } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Sell / Lease Your Property',
  description: 'List your Goa property with EasyLivin. Get multiple offers, professional marketing, and end-to-end guidance from Urmilla Dias.',
}

const STEPS = [
  { icon: ClipboardList, num: '01', title: 'Send Us Your Details', desc: 'Fill in the form with your property details. It takes under 5 minutes.' },
  { icon: Eye, num: '02', title: 'We Showcase Your Property', desc: 'Your property gets listed on our website and shown to our extensive network across India.' },
  { icon: TrendingUp, num: '03', title: 'Receive Multiple Offers', desc: 'We field enquiries, arrange viewings, and negotiate to get you the best possible price.' },
]

const PROPERTY_TYPES_SELL = [
  'Apartments & Penthouses', 'Bungalows & Villas', 'Portuguese Houses / Goan House',
  'Plots', 'Boutique Resort', 'Agriculture / Farm / Orchard Land',
  'Beach / River Side Properties', 'Hotel', 'Industrial Sheds / Plots & Godo',
  'Office', 'Resort and Plots for Resorts', 'Resort for Lease / Rent',
  'Restaurant', 'Row House & Duplex', 'Shop & Showrooms', 'Villa',
]

export default function SellPage() {
  return (
    <>
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Sell / Lease</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">Sell or Lease Your Property</h1>
          <p className="text-white/55 text-[14px] max-w-[500px]">
            EasyLivin gives you a fantastic opportunity to use our network and Internet platform to fetch handsome returns on your property.
          </p>
        </div>
      </div>

      <section className="bg-slate-50 py-12">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {STEPS.map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="bg-white rounded-xl p-6 border border-slate-100 text-center">
                <div className="font-display text-[2.5rem] font-bold text-gold/20 leading-none mb-4">{num}</div>
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-gold" />
                </div>
                <h4 className="font-semibold text-[14px] text-navy mb-2">{title}</h4>
                <p className="text-slate-400 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100 max-w-[820px] mx-auto">
            <h3 className="font-display text-[1.4rem] font-semibold text-navy mb-2">List Your Property with EasyLivin</h3>
            <p className="text-slate-400 text-[13px] mb-7">
              I agree to pay one month&apos;s rent in case of rentals or 2% brokerage in case of purchase.
            </p>

            {/* Personal Info */}
            <div className="mb-7 pb-6 border-b border-slate-100">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gold mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Name of Owner *</label><input className="form-input" type="text" placeholder="Your full name" /></div>
                <div><label className="form-label">Mobile *</label><input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" /></div>
                <div><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="your@email.com" /></div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input appearance-none"><option>Individual</option><option>Agency</option></select>
                </div>
                <div className="sm:col-span-2"><label className="form-label">Address</label><input className="form-input" type="text" placeholder="Your address" /></div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-7 pb-6 border-b border-slate-100">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gold mb-4">Property Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Property Name *</label><input className="form-input" type="text" placeholder="e.g. Villa Serenity" /></div>
                <div>
                  <label className="form-label">Property For *</label>
                  <select className="form-input appearance-none"><option>Sale</option><option>Rent / Lease</option><option>Both</option></select>
                </div>
                <div>
                  <label className="form-label">Property Type</label>
                  <select className="form-input appearance-none">
                    {PROPERTY_TYPES_SELL.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Location *</label>
                  <select className="form-input appearance-none">
                    <option value="">Select location</option>
                    {LOCATIONS.filter(l => l !== 'All Goa').map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Area (Sq. Mts)</label><input className="form-input" type="number" placeholder="e.g. 200" /></div>
                <div><label className="form-label">Number of Bedrooms</label><input className="form-input" type="number" placeholder="e.g. 3" /></div>
                <div>
                  <label className="form-label">Furnished Status</label>
                  <select className="form-input appearance-none"><option>Unfurnished</option><option>Semi Furnished</option><option>Furnished</option></select>
                </div>
                <div>
                  <label className="form-label">Property Status</label>
                  <select className="form-input appearance-none"><option>Ready</option><option>Under Construction</option></select>
                </div>
                <div><label className="form-label">Expected Price (₹)</label><input className="form-input" type="number" placeholder="e.g. 5000000" /></div>
                <div><label className="form-label">Expected Rent (₹)</label><input className="form-input" type="number" placeholder="e.g. 25000" /></div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="form-label">Property Description</label>
              <textarea className="form-input resize-none" rows={4} placeholder="Describe your property — key features, surroundings, unique aspects..." />
            </div>

            <button className="btn-gold w-full justify-center py-4 text-[13px]">
              Submit Property Details
            </button>
            <p className="text-center text-[12px] text-slate-400 mt-3">
              * indicates compulsory fields
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
