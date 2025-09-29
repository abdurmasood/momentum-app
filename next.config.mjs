import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@paper-design/shaders-react'],
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration for bundle optimization (only used when not using Turbopack)
  webpack: async (config, { dev, isServer, webpack }) => {
    // Only apply webpack config when not using Turbopack
    if (process.env.TURBOPACK) {
      return config
    }

    // Bundle analyzer configuration
    if (process.env.BUNDLE_ANALYZE) {
      // Dynamic import for webpack-bundle-analyzer
      const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer')
      
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html',
          openAnalyzer: false,
        })
      )
    }

    // Optimization for shader package
    if (!dev && !isServer) {
      // Add webpack optimization for shader package
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate chunk for shader library
            shaders: {
              test: /[\\/]node_modules[\\/]@paper-design[\\/]shaders-react[\\/]/,
              name: 'shaders',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    // Performance monitoring in development
    if (dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.PERFORMANCE_MONITORING': JSON.stringify('true'),
        })
      )
    }

    return config
  },

  // Build-time bundle analysis
  generateBuildId: async () => {
    // Custom build ID for easier bundle tracking
    return `build-${Date.now()}`
  },

  // Performance optimizations
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)