/** @type {import('next').NextConfig} */

import nextPWA from "next-pwa";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

export default withPWA(nextConfig);
