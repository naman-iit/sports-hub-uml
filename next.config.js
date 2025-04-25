/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's1.ticketm.net',
        pathname: '/dam/**',
      },
      {
        protocol: 'https',
        hostname: 's1.ticketm.net',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig 