export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-deep flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-navy p-12 border-r border-white/8">
        <div>
          <img src="/images/logo.png" alt="Easy Livin Goa" className="h-14 w-auto object-contain mb-12" />
          <h2 className="font-display text-[2.2rem] font-semibold text-white leading-tight mb-4">
            Manage your properties,<br />
            <span className="text-gold">leads & team</span><br />
            in one place.
          </h2>
          <p className="text-white/50 text-[14px] leading-relaxed">
            Easy Livin&apos;s CRM portal gives your team complete visibility over every listing,
            every enquiry, and every deal — with role-based access so each agent sees only what&apos;s theirs.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { num: '1,333+', label: 'Properties managed' },
            { num: '500+', label: 'Agents on platform' },
            { num: '10,000+', label: 'Leads tracked' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="font-display text-[1.5rem] font-bold text-gold">{s.num}</span>
              <span className="text-white/40 text-[13px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  )
}
