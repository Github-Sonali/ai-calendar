// app/models/UserPattern.ts
// Store learned patterns about user's scheduling habits

import mongoose, { Schema, Document } from 'mongoose';

// Define the Event interface for typing
interface IEventForPattern {
  startDate: Date;
  endDate: Date;
  attendees?: string[];
  category?: string;
}

export interface IUserPattern extends Document {
  userId: string;
  commonMeetingTimes: string[];
  averageMeetingDuration: number;
  frequentAttendees: string[];
  preferredCategories: string[];
  meetingFrequency: {
    daily: number;
    weekly: number;
  };
  lastUpdated: Date;
  updatePatterns(events: IEventForPattern[]): Promise<IUserPattern>;
}

const UserPatternSchema = new Schema<IUserPattern>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  commonMeetingTimes: [String], // e.g., ["09:00", "14:00"]
  averageMeetingDuration: {
    type: Number,
    default: 60, // minutes
  },
  frequentAttendees: [String],
  preferredCategories: [String],
  meetingFrequency: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Method to update patterns based on new events
UserPatternSchema.methods.updatePatterns = async function(events: IEventForPattern[]): Promise<IUserPattern> {
  // Calculate common meeting times
  const timeCounts = events.reduce((acc: Record<string, number>, event) => {
    const time = event.startDate.toTimeString().slice(0, 5);
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  this.commonMeetingTimes = Object.entries(timeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([time]) => time);
  
  // Calculate average duration
  const durations = events.map(e => 
    (e.endDate.getTime() - e.startDate.getTime()) / (1000 * 60)
  );
  
  if (durations.length > 0) {
    this.averageMeetingDuration = Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length
    );
  }
  
  // Extract frequent attendees
  const attendeeCounts: Record<string, number> = {};
  events.forEach(event => {
    if (event.attendees && event.attendees.length > 0) {
      event.attendees.forEach(attendee => {
        attendeeCounts[attendee] = (attendeeCounts[attendee] || 0) + 1;
      });
    }
  });
  
  this.frequentAttendees = Object.entries(attendeeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([attendee]) => attendee);
  
  // Extract preferred categories
  const categoryCounts: Record<string, number> = {};
  events.forEach(event => {
    if (event.category) {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    }
  });
  
  this.preferredCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
  
  this.lastUpdated = new Date();
  return this.save();
};

export default mongoose.models.UserPattern || 
  mongoose.model<IUserPattern>('UserPattern', UserPatternSchema);