const nextConfig = {
  webpack: (config) => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty',
    }

    return config
  },
  env: {
    defaultVideoUrl: './static/videos/london_walk.mp4',
  },
}

module.exports = nextConfig
