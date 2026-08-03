const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
    ],
  },
  // Proxy API calls through the CRM's own origin so the browser only ever
  // talks to one origin. This makes the auth cookies genuinely first-party,
  // which is required for SameSite=Strict to work — the CRM and API are
  // deployed as separate services/origins, and Strict cookies are never
  // sent on cross-site requests.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }]
  },
}
module.exports = nextConfig
