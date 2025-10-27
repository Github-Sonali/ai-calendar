import { z } from 'zod';

// Zod schema for validation - ensure data is correct
export const EventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    category: z.enum(['meeting', 'task', 'reminder', 'personal', 'work']),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    isRecurring: z.boolean().default(false),
    recurringPattern: z.string().optional(), // "daily", "monthly", "weekly"
});

// TypeScript type inferred from Zod schema
export type Event = z.infer<typeof EventSchema>;

// Type for AI parsing results
export interface ParsedEventData {
    title?: string;
    data?: string;
    time?: string;
    duration?: string;
    attendees?: string[];
    location?: string;
    description?: string;
    category?: string;
    confidence: number; //How confident AI is about parsing
}

// User patterns for learning
export interface UserPattern {
    userId: string;
    patterns: {
        commonMeetingTimes: string[];
        averageMeetingDuration: number;
        frequentAttendees: string[];
        preferredCategories: string[];
    };
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  type: 'reminder' | 'created' | 'updated' | 'cancelled';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface NotificationPreferences {
  userId: string;
  browserNotifications: boolean;
  emailNotifications: boolean;
  notificationTiming: number; // minutes before event
  soundEnabled: boolean;
}