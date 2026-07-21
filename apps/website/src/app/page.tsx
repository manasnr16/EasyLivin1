import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import FeaturedProperties from '@/components/home/FeaturedProperties'
import ServicesSection from '@/components/home/ServicesSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import BlogSection from '@/components/home/BlogSection'
import InvestmentCTA from '@/components/home/InvestmentCTA'
import { fetchPublicProperties } from '@/lib/api'
import { adaptProperty } from '@/lib/adapters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'EasyLivin Goa | Find Your Dream Property in Goa',
  description:
    'EasyLivin is Goa\'s most trusted real estate platform. Buy, sell or rent — villas, apartments, Portuguese houses, plots and more. Over 1,333 verified properties.',
}

export default async function HomePage() {
  const raw = await fetchPublicProperties({ isFeatured: 'true' })
  const featured = raw.map(adaptProperty)

  return (
    <>
      <HeroSection />
      <FeaturedProperties properties={featured} />
      <ServicesSection />
      <WhyChooseUs />
      <BlogSection />
      <InvestmentCTA />
    </>
  )
}
