// app/calendar/page.tsx
'use client';

import { useState } from 'react';
import Calendar from '../components/Calendar';
import EventForm from '../components/EventForm';
import { useQuery } from '@tanstack/react-query';
import EventCard from '../components/EventCard';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Plus, BarChart3, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  attendees?: string[];
  category: 'meeting' | 'task' | 'reminder' | 'personal' | 'work';
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  recurringPattern?: string;
}

interface EventsResponse {
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: todayEvents } = useQuery<EventsResponse>({
    queryKey: ['events', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch(
        `/api/events?userId=default-user&startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    },
  });

  const { data: weekEvents } = useQuery<EventsResponse>({
    queryKey: ['events', 'week'],
    queryFn: async () => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });

      const response = await fetch(
        `/api/events?userId=default-user&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    },
  });

  const calculateStats = () => {
    if (!weekEvents?.events) {
      return {
        totalEvents: 0,
        meetingHours: '0',
        focusTime: '0',
      };
    }

    const totalEvents = weekEvents.events.length;
    
    const meetingHours = weekEvents.events
      .filter(event => event.category === 'meeting')
      .reduce((total, event) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

    const focusTime = weekEvents.events
      .filter(event => event.category === 'work' || event.category === 'task')
      .reduce((total, event) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

    return {
      totalEvents,
      meetingHours: meetingHours.toFixed(1),
      focusTime: focusTime.toFixed(1),
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Main Calendar */}
      <div className="lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-3xl font-display font-bold text-white">
            Calendar Overview
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl"
          >
            <Plus className="h-5 w-5" />
            Add Event
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <EventForm onSuccess={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <Calendar />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Today's Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-xl text-white mb-4 flex items-center justify-between">
            Today&apos;s Schedule
            <span className="text-sm font-body text-white/70">
              {format(new Date(), 'MMM d')}
            </span>
          </h3>
          
          <div className="space-y-3">
            {todayEvents?.events && todayEvents.events.length > 0 ? (
              todayEvents.events.map((event: CalendarEvent) => (
                <EventCard
                  key={event._id}
                  event={{
                    ...event,
                    startDate: new Date(event.startDate),
                    endDate: new Date(event.endDate),
                  }}
                  onDelete={(id) => {
                    console.log('Delete event:', id);
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-body">
                  No events scheduled for today
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-electric-blue" />
            Weekly Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 font-body">
                  Total Events
                </span>
                <span className="font-bold text-white text-xl">
                  {stats.totalEvents}
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 font-body">
                  Meeting Hours
                </span>
                <span className="font-bold text-white text-xl">
                  {stats.meetingHours}h
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 font-body">
                  Focus Time
                </span>
                <span className="font-bold text-white text-xl">
                  {stats.focusTime}h
                </span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-6">
            <div className="bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(parseFloat(stats.meetingHours) / 40) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-electric-blue to-bright-purple"
              />
            </div>
            <p className="text-xs text-white/50 mt-2 font-body">
              {stats.meetingHours}h of 40h weekly capacity
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}