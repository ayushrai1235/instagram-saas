import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ✅ allow next dev to work behind ngrok
  allowedDevOrigins: ["crazed-smasher-unmasked.ngrok-free.dev"],
};

export default nextConfig;
