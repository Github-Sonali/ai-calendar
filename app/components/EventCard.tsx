// app/components/EventCard.tsx
'use client';

import { format } from 'date-fns';
import { Clock, MapPin, Users, Trash2, Edit, Zap, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Event } from '../lib/types';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event & { _id: string };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const brightCategoryColors = {
  meeting: 'from-electric-blue to-bright-purple',
  task: 'from-neon-green to-vivid-teal',
  reminder: 'from-cyber-yellow to-sunset-orange',
  personal: 'from-hot-pink to-bright-purple',
  work: 'from-deep-indigo to-electric-blue',
};

const categoryIcons = {
  meeting: Users,
  task: Target,
  reminder: Clock,
  personal: Zap,
  work: Target,
};

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const categoryGradient = brightCategoryColors[event.category];
  const CategoryIcon = categoryIcons[event.category];
  const priorityColor = priorityColors[event.priority];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-5 border border-white/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display font-bold text-white flex items-center gap-2 text-lg">
            <CategoryIcon className={cn("h-5 w-5", priorityColor)} />
            {event.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1 text-white/70">
              <Clock className="h-3 w-3" />
              {format(new Date(event.startDate), 'MMM d, h:mm a')}
            </span>
            <span className={cn(
              "px-3 py-1 rounded-lg text-xs text-white font-bold",
              `bg-gradient-to-r ${categoryGradient}`
            )}>
              {event.category}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit?.(event._id)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Edit event"
          >
            <Edit className="h-4 w-4 text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete?.(event._id)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete event"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </motion.button>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-white/70 mb-3 font-body">
          {event.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2">
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="h-3 w-3 text-electric-blue" />
            <span className="font-body">{event.location}</span>
          </div>
        )}
        
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Users className="h-3 w-3 text-bright-purple" />
            <span className="font-body">{event.attendees.join(', ')}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}