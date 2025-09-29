import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental optimizations for package imports
  experimental: {
    optimizePackageImports: ['@stackframe/stack']
  },
  
  // Bundle analyzer configuration
  env: {
    ANALYZE: process.env.ANALYZE || 'false',
    BUNDLE_ANALYZE: process.env.BUNDLE_ANALYZE || 'false'
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Only optimize for production client bundles
    if (!isServer && !dev) {
      // Configure chunk splitting for auth modules
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate auth components into their own chunk
            auth: {
              test: /[\\/]node_modules[\\/]@stackframe[\\/]stack/,
              name: 'auth-vendor',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            // Separate date utilities if they exist
            dateFns: {
              test: /[\\/]node_modules[\\/]@?date-fns/,
              name: 'date-vendor',
              chunks: 'async', // Only load when needed
              priority: 8,
            },
            // Common vendor chunk for other large dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
              minSize: 100000, // Only create chunk if it's > 100kb
            }
          }
        }
      }
    }

    // Add module aliases for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      // Provide empty modules for server-only Stack Auth components if needed
      // This helps reduce client bundle size
    }

    return config
  },

  // Headers for better caching
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Preload handler resources for better performance
        source: '/handler/(.*)',
        headers: [
          {
            key: 'Link',
            value: '</handler/auth-vendor.js>; rel=preload; as=script'
          }
        ]
      }
    ]
  },

  // Compiler optimizations
  compiler: {
    // Remove console.logs in production but keep console.warn and console.error
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
  }
};

// Conditionally wrap with bundle analyzer
let configWithAnalyzer = nextConfig;

if (process.env.ANALYZE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
    openAnalyzer: true
  });
  configWithAnalyzer = withBundleAnalyzer(nextConfig);
}

export default configWithAnalyzer;
