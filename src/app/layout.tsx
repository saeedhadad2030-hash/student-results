import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Results Portal | Mid-term Examinations',
  description: 'Official Examination Results Portal for International Public Schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased text-slate-800 bg-slate-50 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
