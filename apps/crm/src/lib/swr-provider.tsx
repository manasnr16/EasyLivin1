'use client'

import { SWRConfig } from 'swr'

// Global cache tuning: every page's useSWR keeps its cached data when you
// navigate away and back, so clicking between already-visited nav items
// paints instantly instead of showing a fresh loading state each time.
// revalidateOnFocus is what causes an extra request "flash" every time you
// switch back to the browser tab — off by default here since it's a CRM,
// not a live feed.
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 15_000,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
