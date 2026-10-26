import type { NextConfig } from 'next';

// GitHub Pages serves this repo at /Elevique-Flow-releases, as plain static files.
const basePath = '/Elevique-Flow-releases';

const config: NextConfig = {
  output: 'export',
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
};

export default config;
