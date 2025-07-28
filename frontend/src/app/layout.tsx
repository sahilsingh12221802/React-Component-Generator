// app/layout.tsx (Server Component)
import { ClientProviders } from './client-providers';
import { metadata } from './metadata';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

export { metadata };