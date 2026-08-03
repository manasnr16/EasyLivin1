export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-navy-deep flex relative">
      {/* Logo pinned to the true top-left corner of the viewport — fixed
          positioning so it stays there regardless of breakpoint/column
          layout, instead of just being "first" inside a padded flex box. */}
      <img
        src="/images/logo.png"
        alt="Easy Livin Goa"
        className="fixed top-6 left-6 lg:top-8 lg:left-8 h-14 lg:h-20 w-auto object-contain z-20"
      />

      {/* Left brand panel — headline centered in the vertical space */}
      <div className="hidden lg:flex flex-col w-[460px] bg-navy p-10 border-r border-white/8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 -left-28 w-80 h-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          aria-hidden
        />

        <div className="flex-1 flex items-center relative">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-light/80 mb-4">
              CRM Portal
            </span>
            <h2 className="font-display text-[2.15rem] font-semibold text-white leading-[1.15]">
              Manage your properties,<br />
              <span className="text-gold-light">leads &amp; team</span><br />
              in one place.
            </h2>
          </div>
        </div>

        <p className="relative text-[11px] text-white/25 tracking-wide">
          &copy; {new Date().getFullYear()} Easy Livin Goa. All rights reserved.
        </p>
      </div>

      {/* Right content */}
      <div
        className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-slate-50 relative"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      >
        {children}
      </div>
    </div>
  )
}
