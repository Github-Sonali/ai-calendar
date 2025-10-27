// app/lib/notifications.ts
import { toast } from 'react-hot-toast';

// Define event type
interface CalendarEvent {
  _id: string;
  title: string;
  startDate: Date | string;
  location?: string;
  description?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    // Create notification options without vibrate for standard API
    const notificationOptions: NotificationOptions = {
      icon: '/calendar-icon.png',
      badge: '/calendar-badge.png',
      ...options,
    };

    // Try to use vibrate if the browser supports it (mainly mobile)
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (error) {
      console.log('Vibration not supported');
    }

    const notification = new Notification(title, notificationOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      info: '📅',
    };

    toast(message, {
      icon: icons[type],
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  }

  async scheduleNotification(event: CalendarEvent, minutesBefore: number = 15) {
    const eventTime = new Date(event.startDate).getTime();
    const notificationTime = eventTime - (minutesBefore * 60 * 1000);
    const now = Date.now();

    if (notificationTime > now) {
      const timeout = notificationTime - now;
      
      // Clear any existing timeout for this event
      if (this.scheduledTimeouts.has(event._id)) {
        const existingTimeout = this.scheduledTimeouts.get(event._id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
      }
      
      // Schedule new notification
      const timeoutId = setTimeout(() => {
        this.showNotification(
          `Upcoming: ${event.title}`,
          {
            body: `Starting in ${minutesBefore} minutes${event.location ? ` at ${event.location}` : ''}`,
            tag: event._id,
            requireInteraction: true,
          }
        );
        
        // Remove from scheduled timeouts
        this.scheduledTimeouts.delete(event._id);
      }, timeout);
      
      // Store timeout reference
      this.scheduledTimeouts.set(event._id, timeoutId);
    }
  }

  // Cancel a scheduled notification
  cancelScheduledNotification(eventId: string) {
    if (this.scheduledTimeouts.has(eventId)) {
      const timeout = this.scheduledTimeouts.get(eventId);
      if (timeout) {
        clearTimeout(timeout);
        this.scheduledTimeouts.delete(eventId);
      }
    }
  }

  // Clear all scheduled notifications
  clearAllScheduledNotifications() {
    this.scheduledTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.scheduledTimeouts.clear();
  }
}

export const notificationService = new NotificationService();