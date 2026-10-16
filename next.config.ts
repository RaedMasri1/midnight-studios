import type { NextConfig } from "next";

const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(publicKey?.startsWith('sb_secret_'))throw new Error('Use a Supabase publishable key in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
if(publicKey?.startsWith('ey')){try{if(JSON.parse(Buffer.from(publicKey.split('.')[1],'base64url').toString()).role==='service_role')throw new Error('A service-role key must never be placed in NEXT_PUBLIC_ variables.');}catch(error){if(error instanceof Error&&error.message.includes('service-role'))throw error;}}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ['terminal.local', '127.0.0.1'],
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ['radix-ui', 'lucide-react'], cpus: 2 },
};

export default nextConfig;
