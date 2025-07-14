// next.config.js
import {PrismaPlugin} from '@prisma/nextjs-monorepo-workaround-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin())
    }

    return config
  },
}

module.exports = nextConfig
