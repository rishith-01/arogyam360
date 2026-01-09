/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Mark undici as external for server components (Next.js 16+)
  serverExternalPackages: ['undici'],
  // Empty turbopack config to silence the warning
  turbopack: {},
};

module.exports = nextConfig;

