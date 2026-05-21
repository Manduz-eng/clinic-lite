/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to complete even if there are linting errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
