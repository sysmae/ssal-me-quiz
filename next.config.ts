import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'ojttkweczzpdvnpaesyn.supabase.co',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '30mb', // PDF 업로드 용량 제한 상향 (필요시 더 늘릴 수 있음)
  },
}

export default nextConfig
