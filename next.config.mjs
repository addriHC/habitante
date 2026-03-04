/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/quienes-somos', destination: '/quienes-somos.html' },
      { source: '/sociedades', destination: '/sociedades.html' },
      { source: '/marketplace', destination: '/marketplace.html' },
      { source: '/proyectos-estudio', destination: '/proyectos-estudio.html' },
      { source: '/proyecto-detalle', destination: '/proyecto-detalle.html' },
      { source: '/inversores', destination: '/inversores.html' },
      { source: '/iniciativas', destination: '/iniciativas.html' },
      // { source: '/plataforma', destination: '/plataforma/index.html' },
      { source: '/recursos', destination: '/recursos.html' },
      { source: '/contacto', destination: '/contacto.html' }
    ];
  }
};

export default nextConfig;
