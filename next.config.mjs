/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Enable instrumentation for Sentry
    instrumentationHook: true,
  },

  // Webpack configuration for Sentry
  webpack: (config, { isServer: _isServer }) => {
    // Only run Sentry in production with DSN configured
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry source maps upload would be configured here
      // via @sentry/webpack-plugin, installed separately
      // _isServer can be used for server-specific config
      void _isServer;
    }
    return config;
  },
};

export default nextConfig
