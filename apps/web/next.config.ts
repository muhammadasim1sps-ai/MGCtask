import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

// Next loads .env files from apps/web by default. The project keeps one shared
// runtime file at the repository root, so load it before route handlers read
// their server-only service URLs.
const projectRoot = path.resolve(__dirname, "../..");
loadEnvConfig(projectRoot);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The UI is being opened from this machine's LAN address during development.
  // Allow Next's client bundles and HMR connection for that origin as well.
  allowedDevOrigins: ["192.168.11.20"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
