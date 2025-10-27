// app/layout.tsx (complete updated version)
import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { Zap, Calendar } from 'lucide-react';
import NotificationBell from './components/NotificationBell';
import NotificationTester from './components/NotificationTester';

export const metadata: Metadata = {
  title: 'AI Calendar Pro - Intelligent Scheduling',
  description: 'Professional AI-powered calendar for smart scheduling and time management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body">
        <Providers>
          <div className="min-h-screen">
            <nav className="glass sticky top-0 z-50 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-electric-blue to-bright-purple rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-white">
                      AI Calendar Pro
                    </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <NotificationBell />
                    <span className="text-sm text-white/80 font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyber-yellow" />
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </Providers>
        {process.env.NODE_ENV === 'development' && <NotificationTester />}
      </body>
    </html>
  );
}