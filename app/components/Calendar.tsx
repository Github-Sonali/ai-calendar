// app/components/Calendar.tsx
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar as BigCalendar, 
  dateFnsLocalizer, 
  View, 
  NavigateAction,
  EventPropGetter 
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight, Loader2, Zap } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    category: string;
    description?: string;
    location?: string;
  };
}

interface ApiEvent {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  category: string;
  description?: string;
  location?: string;
}

interface EventsResponse {
  events: ApiEvent[];
}

interface CustomToolbarProps {
  label: string;
  onNavigate: (action: NavigateAction) => void;
  onView: (view: View) => void;
  view: View;
}

// Bright professional colors for categories
const brightCategoryColors = {
  meeting: 'bg-gradient-to-r from-electric-blue to-bright-purple',
  task: 'bg-gradient-to-r from-neon-green to-vivid-teal',
  reminder: 'bg-gradient-to-r from-cyber-yellow to-sunset-orange',
  personal: 'bg-gradient-to-r from-hot-pink to-bright-purple',
  work: 'bg-gradient-to-r from-deep-indigo to-electric-blue',
};

export default function Calendar() {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ['events', date],
    queryFn: async () => {
      const start = startOfWeek(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);

      const response = await fetch(
        `/api/events?userId=default-user&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    },
  });

  const calendarEvents: CalendarEvent[] = data?.events?.map((event: ApiEvent) => ({
    id: event._id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    resource: {
      category: event.category,
      description: event.description,
      location: event.location,
    },
  })) || [];

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const eventStyleGetter: EventPropGetter<CalendarEvent> = useCallback((event: CalendarEvent) => {
    const categoryColor = brightCategoryColors[event.resource.category as keyof typeof brightCategoryColors] || 'bg-gradient-to-r from-gray-400 to-gray-600';
    
    return {
      className: cn(categoryColor, 'text-white font-semibold shadow-lg'),
    };
  }, []);

  const CustomToolbar = useCallback(({ label, onNavigate, onView }: CustomToolbarProps) => (
    <div className="flex items-center justify-between mb-6 p-6 glass rounded-2xl">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('PREV')}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('TODAY')}
          className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-electric-blue to-bright-purple text-white rounded-xl hover:shadow-neon transition-all duration-300"
        >
          Today
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('NEXT')}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </motion.button>
      </div>

      <h2 className="text-2xl font-display font-bold text-white">
        {label}
      </h2>

      <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
        {(['month', 'week', 'day'] as View[]).map((viewName) => (
          <motion.button
            key={viewName}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onView(viewName)}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300",
              view === viewName
                ? "bg-gradient-to-r from-electric-blue to-bright-purple text-white"
                : "text-white/80 hover:bg-white/10"
            )}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </motion.button>
        ))}
      </div>
    </div>
  ), [view]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-electric-blue mx-auto mb-4" />
          <p className="text-white font-body">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center glass rounded-2xl p-8">
          <p className="text-red-400 mb-4 font-body text-lg">Failed to load calendar</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['events'] })}
            className="px-6 py-3 btn-primary rounded-xl font-bold"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[600px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-modern p-6"
    >
      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
                startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: (props) => (
            <CustomToolbar 
              {...props} 
              view={view}
            />
          ),
        }}
        onSelectEvent={(event) => {
          console.log('Selected event:', event);
        }}
        onDoubleClickEvent={(event) => {
          if (confirm('Delete this event?')) {
            deleteEventMutation.mutate(event.id);
          }
        }}
      />
    </motion.div>
  );
}