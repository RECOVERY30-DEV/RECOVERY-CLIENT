import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
