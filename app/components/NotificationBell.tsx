// app/components/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await fetch('/api/notifications?userId=default-user&unreadOnly=true');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = data?.notifications?.filter((n: Notification) => !n.read).length || 0;

  const handleMarkAllRead = () => {
    const unreadIds = data?.notifications
      ?.filter((n: Notification) => !n.read)
      .map((n: Notification) => n._id) || [];
    
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      reminder: '⏰',
      created: '✅',
      updated: '📝',
      cancelled: '❌',
    };
    return icons[type] || '📅';
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-xl z-50 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-white/70" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-electric-blue hover:text-bright-purple mt-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-80">
                {isLoading ? (
                  <div className="p-4 text-center text-white/60">
                    Loading...
                  </div>
                ) : data?.notifications?.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {data.notifications.map((notification: Notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-4 hover:bg-white/5 transition-colors cursor-pointer",
                          !notification.read && "bg-white/5"
                        )}
                        onClick={() => {
                          if (!notification.read) {
                            markAsReadMutation.mutate([notification._id]);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-white/70 text-xs mt-1">
                              {notification.message}
                            </p>
                            <p className="text-white/50 text-xs mt-2">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-electric-blue rounded-full" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-white/60">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}