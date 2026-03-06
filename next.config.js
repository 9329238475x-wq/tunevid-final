/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Browser extensions se aane wale unknown attributes ko ignore karo
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Hydration errors ko suppress karne ke liye
  onDemandEntries: {
    // Page ko memory mein kitni der rakhna hai (ms)
    maxInactiveAge: 25 * 1000,
    // Kitne pages simultaneously compile ho sakte hain
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
