import { fetchPublicProperties } from '@/lib/api'
import { adaptProperty } from '@/lib/adapters'
import BuyPageClient from './BuyPageClient'

export const dynamic = 'force-dynamic'

export default async function BuyPage() {
  const raw = await fetchPublicProperties({ listingType: 'SALE', limit: '50' })
  const properties = raw.map(adaptProperty)
  return <BuyPageClient initialProperties={properties} />
}
