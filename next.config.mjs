/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mounting during HLS attachment in dev
  images: {
    unoptimized: true, // Necessary because IPTV posters and channel logos come from diverse external HTTP/HTTPS streams
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
