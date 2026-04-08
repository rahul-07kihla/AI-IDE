import type { NextConfig } from 'next';

const distDir = process.env.NOVA_NEXT_DIST_DIR || '.next-build';

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-ide/shared'],
  distDir,
  output: 'export',
};

export default nextConfig;
