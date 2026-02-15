import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ortho TC Conversion CRM',
  description: 'Mock TC conversion Kanban board'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
