import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Service workers are only useful in production. Skipping in dev avoids
  // stale caching surprises while iterating.
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Empty turbopack config silences the "webpack config without turbopack
  // config" warning. Serwist's webpack config is only consumed by
  // `next build --webpack`; dev (which disables Serwist) runs on Turbopack
  // without needing it.
  turbopack: {},
};

export default withSerwist(nextConfig);
