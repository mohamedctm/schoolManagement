/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Add a rule to handle HTML files in the specific Mapbox package directory.
    config.module.rules.push({
      test: /\.html$/,
      include: /node_modules\/@mapbox\/node-pre-gyp\/lib\/util\/nw-pre-gyp/,
      use: 'raw-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
