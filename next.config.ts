import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  images:{remotePatterns:[{protocol:'https',hostname:'images.unsplash.com'}],formats:['image/avif','image/webp']},
  poweredByHeader:false
};
export default nextConfig;