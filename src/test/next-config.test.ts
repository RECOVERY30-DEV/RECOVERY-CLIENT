import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'

describe('Turbopack SVG loader', () => {
  it('preserves viewBox so fixed-size SVGs do not overflow their containers', () => {
    expect(nextConfig.turbopack?.rules?.['*.svg']).toMatchObject({
      loaders: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
      as: '*.js',
    })
  })
})
