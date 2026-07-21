/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      // Property photos served by the local API's disk storage in dev
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
    ],
  },
}

module.exports = nextConfig
