// app/components/NotificationTester.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationTester() {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    // Check for notifications every 30 seconds in development
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/cron/notifications');
        const data = await response.json();
        
        if (data.processed > 0) {
          toast.success(`Sent ${data.processed} notification(s)`, {
            icon: '🔔',
          });
        }
      } catch (error) {
        console.error('Notification check failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isRunning]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={() => setIsRunning(!isRunning)}
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${
        isRunning 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-500 hover:bg-gray-600'
      }`}
      title={isRunning ? 'Notification checker running' : 'Start notification checker'}
    >
      <Bell className={`h-5 w-5 text-white ${isRunning ? 'animate-pulse' : ''}`} />
    </button>
  );
}