import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Sofa Plus Mini CRM',
  description: 'Lead-first mini CRM for showroom operations'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
