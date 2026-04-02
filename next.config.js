/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "upload.wikimedia.org",
      "utfs.io",
      "images.pexels.com",
    ],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: require.resolve('encoding'),
        'supports-color': require.resolve('supports-color'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
