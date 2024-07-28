/** @type {import('next').NextConfig} */

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    ENV: (() => {
      if (isDev) return "development";
      if (isProd) return "production";
    })(),
  };

  return {
    reactStrictMode: false,
    images: {
      unoptimized: true,
    },
    env,
    experimental: {
    esmExternals: 'loose',
  },
  };
};
