// Shown instantly by Next.js while a route segment under (dashboard) is
// compiling/loading, so navigation never looks frozen. One file here covers
// every page in the group — no need to duplicate it per route.
export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="skeleton h-6 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-full" />
        ))}
      </div>
    </div>
  )
}
