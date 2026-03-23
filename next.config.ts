import type { NextConfig } from "next"
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // must turn this option off if you wanna activate basic auth...
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  allowedDevOrigins: ['192.168.10.68', '*.192.168.10.68'],
}

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
})

export default withMDX(nextConfig)
