const remotePatterns = [];

if (process.env.SUPABASE_URL) {
  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  remotePatterns.push({
    protocol: supabaseUrl.protocol.slice(0, -1),
    hostname: supabaseUrl.hostname,
    port: supabaseUrl.port,
    pathname: '/storage/v1/object/public/profile-avatars/**',
  });
}

module.exports = {
  reactStrictMode: true,
  serverExternalPackages: ['sweph'],
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    maximumResponseBody: 5 * 1024 * 1024,
    remotePatterns,
  },
  compress: true,
};