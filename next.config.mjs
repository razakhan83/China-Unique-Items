const nextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    cachedNavigations: true,
    appNewScrollHandler: true,
  },
  transpilePackages: ['swiper'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
