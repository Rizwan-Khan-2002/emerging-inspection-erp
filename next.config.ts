import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools indicator ("N" button, bottom-left in dev mode).
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
