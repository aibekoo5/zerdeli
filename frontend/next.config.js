/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force browsers to revalidate HTML documents so a new deploy is picked up
  // immediately. Hashed assets under /_next/static keep their long cache.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      }
    ],
  },
};

module.exports = nextConfig;
