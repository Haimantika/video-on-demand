/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving for the uploads directory
  output: 'standalone',
  
  // Configure headers for video files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
