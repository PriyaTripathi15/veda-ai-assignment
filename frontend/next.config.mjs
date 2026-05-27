import { dirname } from "path"
import { fileURLToPath } from "url"

const frontendRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: frontendRoot,
  },
}

export default nextConfig
