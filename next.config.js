// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for development
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Compress responses
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Image optimization
  images: {
    unoptimized: true, // Since we're not using next/image
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'AI Summarizer',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/api/summarize',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;