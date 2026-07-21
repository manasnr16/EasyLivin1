import { notFound } from 'next/navigation'
import { fetchPublicPropertyBySlug } from '@/lib/api'
import { adaptProperty } from '@/lib/adapters'
import PropertyDetailClient from './PropertyDetailClient'

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const raw = await fetchPublicPropertyBySlug(params.slug)
  if (!raw) notFound()

  const property = adaptProperty(raw)
  return <PropertyDetailClient property={property} />
}
