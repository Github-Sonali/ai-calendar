// app/components/EventForm.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, Sparkles, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { notificationService } from '../lib/notifications';

interface EventFormProps {
  onSuccess?: () => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: async (naturalLanguageInput: string) => {
      try {
        const parseResponse = await fetch('/api/ai/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: naturalLanguageInput,
            userId: 'default-user'
          }),
        });

        if (!parseResponse.ok) {
          const errorText = await parseResponse.text();
          console.error('Parse API error:', errorText);
          throw new Error(`Failed to parse input: ${parseResponse.status}`);
        }

        let parseResult;
        try {
          parseResult = await parseResponse.json();
        } catch {
          console.error('Failed to parse JSON response');
          throw new Error('Invalid response from AI parser');
        }

        const { event } = parseResult;

        const createResponse = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            userId: 'default-user',
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create event');
        }

        return createResponse.json();
      } catch (error) {
        console.error('Full error:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Show success toast
      toast.success(`Event "${data.event.title}" created successfully!`, {
        duration: 4000,
        icon: '🎉',
      });
      
      // Request notification permission if not granted
      const permissionGranted = await notificationService.requestPermission();
      
      if (permissionGranted) {
        // Schedule browser notification for the event
        notificationService.scheduleNotification(data.event, 1);
        
        toast.success('Reminder set for 15 minutes before the event', {
          duration: 3000,
          icon: '🔔',
        });
      }
      
      // Trigger confetti with bright colors
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0080FF', '#8B5CF6', '#EC4899', '#10B981', '#F97316']
      });
      
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event', {
        duration: 4000,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      await createEventMutation.mutateAsync(input);
    } finally {
      setIsProcessing(false);
    }
  };

  const examplePrompts = [
    "Team meeting tomorrow at 2pm",
    "Client call on Friday at 3pm",
    "Project deadline next Monday",
    "Conference call at 10am",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-8 border border-white/20"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-electric-blue" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Schedule your next meeting..."
                className={cn(
                  "block w-full pl-12 pr-14 py-4",
                  "bg-white/10 backdrop-blur-sm",
                  "border-2 border-white/20 rounded-xl",
                  "focus:ring-2 focus:ring-electric-blue focus:border-transparent",
                  "text-white placeholder-white/60",
                  "font-body text-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300"
                )}
                disabled={isProcessing || createEventMutation.isPending}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isProcessing || createEventMutation.isPending}
                className={cn(
                  "absolute inset-y-0 right-0 pr-4 flex items-center",
                  "text-electric-blue hover:text-bright-purple",
                  "disabled:text-gray-400 disabled:cursor-not-allowed",
                  "transition-colors duration-300"
                )}
              >
                {isProcessing || createEventMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {createEventMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl text-white flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-body">
                  {createEventMutation.error?.message || 'Something went wrong'}
                </span>
              </motion.div>
            )}

            {createEventMutation.isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-xl text-white flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-body">Event created successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <p className="text-sm text-white/80 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyber-yellow" />
              Quick examples:
            </p>
            <div className="flex flex-wrap gap-3">
              {examplePrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className={cn(
                    "px-4 py-2 text-sm",
                    "bg-white/10 backdrop-blur-sm",
                    "hover:bg-white/20",
                    "rounded-lg text-white font-medium",
                    "border border-white/20",
                    "transition-all duration-300"
                  )}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}