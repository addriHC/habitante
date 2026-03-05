import './globals.css';

export const metadata = {
  title: 'Habitante',
  description: 'Habitante unified web and backoffice'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
