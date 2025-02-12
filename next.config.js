/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Permite usar imagens sem otimização
  },
  reactStrictMode: true, // Habilita o modo estrito para melhor depuração
  swcMinify: true, // Usa a minificação do SWC para melhorar a performance
};

module.exports = nextConfig;
