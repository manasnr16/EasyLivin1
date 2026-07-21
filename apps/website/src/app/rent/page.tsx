import { fetchPublicProperties } from '@/lib/api'
import { adaptProperty } from '@/lib/adapters'
import RentPageClient from './RentPageClient'

export const dynamic = 'force-dynamic'

export default async function RentPage() {
  const raw = await fetchPublicProperties({ listingType: 'RENT', limit: '50' })
  const properties = raw.map(adaptProperty)
  return <RentPageClient initialProperties={properties} />
}
