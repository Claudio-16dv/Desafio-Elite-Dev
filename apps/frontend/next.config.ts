import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Fixa a raiz do monorepo (build sempre roda a partir de apps/frontend).
  // Evita o Next inferir a raiz errada por causa de lockfiles fora do projeto.
  outputFileTracingRoot: path.join(process.cwd(), '../../'),
  transpilePackages: ['@app/shared'],
};

export default nextConfig;
