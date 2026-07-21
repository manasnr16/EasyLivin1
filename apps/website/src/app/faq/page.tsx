'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

const FAQS = [
  {
    q: 'Can any Indian citizen buy property in Goa?',
    a: 'Yes. Any Indian citizen residing in India can purchase residential or commercial property in Goa. NRIs and PIOs can also purchase residential and commercial properties, though agricultural land and plantation property purchases have certain restrictions. EasyLivin will guide you through the specific requirements based on your situation.',
  },
  {
    q: 'What documents are needed to buy a property in Goa?',
    a: 'The key documents include: Sale Deed / Agreement to Sale, Title Deed (going back at least 30 years), Encumbrance Certificate, Property Tax Receipts, Form I & XIV (7/12 extract equivalent), Building Plan Approval, Occupancy Certificate, and No Objection Certificate if applicable. Our team ensures all documents are in order before you proceed.',
  },
  {
    q: 'What is the brokerage charged by EasyLivin?',
    a: "EasyLivin charges 2% brokerage on the purchase price in case of sale transactions, and one month's rent in case of rental transactions. This is agreed upon before any transaction proceeds and there are no hidden charges.",
  },
  {
    q: 'How long does a property purchase take in Goa?',
    a: 'From agreement to registration, a straightforward transaction typically takes 45–90 days, depending on how quickly title verification can be completed and funding is arranged. Our team coordinates with lawyers and the sub-registrar\'s office to keep the process moving as smoothly as possible.',
  },
  {
    q: 'Can NRIs buy property in Goa?',
    a: 'Yes. NRIs (Non-Resident Indians) and PIOs (Persons of Indian Origin) can purchase residential and commercial property in Goa under the provisions of FEMA. Agricultural land, plantation property, and farmhouses have restrictions. All payments must be made through banking channels. EasyLivin has extensive experience assisting NRI clients and can guide you through the entire process remotely if needed.',
  },
  {
    q: 'What types of properties does EasyLivin list?',
    a: 'We list the full spectrum of Goa real estate: apartments and penthouses, bungalows and villas, Portuguese houses and traditional Goan homes, agricultural and farm land, plots, boutique resorts, hotels, commercial properties, industrial sheds, row houses, shops and showrooms. If you are looking for any property in Goa, EasyLivin is the one stop shop.',
  },
  {
    q: "What are EasyLivin's working hours?",
    a: 'Our office is open Monday to Saturday, 9:00 am to 6:00 pm. You can also reach Urmilla Dias directly on 88888 06964 for urgent enquiries outside office hours.',
  },
  {
    q: 'Do you arrange property viewings?',
    a: "Absolutely. Once we have understood your requirement — whether buying, selling, or renting — our realtors will identify properties that suit your requirement in terms of budget and location from our extensive database, and will be happy to arrange viewings of shortlisted properties. All this can be done from our office, saving you valuable time and energy.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">FAQ</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-white/55 text-[14px]">
            Everything you need to know about buying, renting and selling property in Goa.
          </p>
        </div>
      </div>

      <section className="bg-white py-12">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="space-y-0 divide-y divide-slate-100">
            {FAQS.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  className="w-full flex items-center justify-between gap-6 text-left group"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-display text-[1.05rem] font-semibold text-navy group-hover:text-gold transition-colors">
                    {faq.q}
                  </span>
                  <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    openIndex === i ? 'bg-gold text-navy-deep rotate-45' : 'bg-gold/10 text-gold'
                  }`}>
                    <Plus size={15} />
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                  <p className="text-slate-500 text-[13.5px] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-navy rounded-2xl p-8 text-center">
            <h3 className="font-display text-[1.3rem] font-semibold text-white mb-2">Still have questions?</h3>
            <p className="text-white/50 text-[13px] mb-5">Speak directly with Urmilla Dias for personalised guidance.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/contact" className="btn-gold">Get in Touch</Link>
              <a href="tel:+918888806964" className="btn-outline-white">Call Now</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
