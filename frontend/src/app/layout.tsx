import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentAI',
  description: 'AI-Powered Applicant Tracking System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}