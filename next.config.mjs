/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle the DejaVu fonts (read at runtime via process.cwd()/fonts) into the
  // serverless functions that render branded images — Next's tracer can't see
  // an fs read, so include them explicitly. Without this, image text renders
  // blank on Vercel/Lambda. Scoped to the routes that generate images.
  experimental: {
    outputFileTracingIncludes: {
      "/projects/**": ["./fonts/**"],
    },
  },
};

export default nextConfig;
