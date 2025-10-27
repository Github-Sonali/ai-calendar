// app/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parse, addMinutes, startOfWeek, endOfWeek, addDays as addDaysFns } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDateTime(date?: string, time?: string): Date {
  const now = new Date();
  let resultDate = now;

  if (date) {
    const relativeDates: Record<string, () => Date> = {
      'today': () => new Date(),
      'tomorrow': () => addDaysFns(new Date(), 1),
      'next week': () => addDaysFns(new Date(), 7),
      'next monday': () => getNextWeekday(1),
      'next tuesday': () => getNextWeekday(2),
      'next wednesday': () => getNextWeekday(3),
      'next thursday': () => getNextWeekday(4),
      'next friday': () => getNextWeekday(5),
    };

    const lowerDate = date.toLowerCase();
    if (relativeDates[lowerDate]) {
      resultDate = relativeDates[lowerDate]();
    } else {
      try {
        resultDate = parse(date, 'yyyy-MM-dd', new Date());
      } catch {
        resultDate = new Date(date);
      }
    }
  }

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    resultDate.setHours(hours, minutes, 0, 0);
  }

  return resultDate;
}

function getNextWeekday(targetDay: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
  return addDaysFns(today, daysUntilTarget);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
}

export function calculateEndDate(startDate: Date, durationMinutes: number): Date {
  return addMinutes(startDate, durationMinutes);
}

export function getWeekDates(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Define proper types for the debounce function
type AnyFunction = (...args: unknown[]) => unknown;

export function debounce<T extends AnyFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function extractAttendees(text: string): string[] {
  // Look for patterns like "with John", "and Sarah", "@mike"
  const patterns = [
    /with\s+(\w+)/gi,
    /and\s+(\w+)/gi,
    /@(\w+)/gi,
  ];
  
  const attendees = new Set<string>();
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        attendees.add(match[1].toLowerCase());
      }
    }
  });
  
  return Array.from(attendees);
}

export const categoryColors = {
  meeting: 'bg-blue-500',
  task: 'bg-green-500',
  reminder: 'bg-yellow-500',
  personal: 'bg-purple-500',
  work: 'bg-gray-500',
} as const;

export const priorityConfig = {
  low: { color: 'text-gray-500', icon: '○' },
  medium: { color: 'text-yellow-500', icon: '◐' },
  high: { color: 'text-red-500', icon: '●' },
} as const;