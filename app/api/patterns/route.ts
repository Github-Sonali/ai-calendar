// app/api/patterns/route.ts
// Learn and retrieve user patterns

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/db';  // Adjust path based on your structure
import Event from '../../../models/Event';  // Adjust path based on your structure
import UserPattern from '../../../models/UserPattern';  // Adjust path based on your structure

// Type for the event from database
interface IEventDoc {
  startDate: Date;
  endDate: Date;
  attendees?: string[];
  category: string;
}

// GET user patterns
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default-user';

    let pattern = await UserPattern.findOne({ userId });

    // If no pattern exists, create one by analyzing existing events
    if (!pattern) {
      const events = await Event.find({ userId })
        .sort({ startDate: -1 })
        .limit(50); // Analyze last 50 events

      if (events.length > 0) {
        pattern = await analyzeAndCreatePattern(userId, events);
      } else {
        // Return default pattern
        pattern = {
          userId,
          commonMeetingTimes: ['09:00', '14:00'],
          averageMeetingDuration: 60,
          frequentAttendees: [],
          preferredCategories: ['meeting'],
        };
      }
    }

    return NextResponse.json({ pattern });
  } catch (error) {
    console.error('Get patterns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}

// Helper function to analyze events and create patterns
async function analyzeAndCreatePattern(userId: string, events: IEventDoc[]) {
  // Extract meeting times
  const timeSlots = events.map(e => {
    const time = new Date(e.startDate).toTimeString().slice(0, 5);
    return time;
  });

  // Count frequency of each time slot
  const timeCounts = timeSlots.reduce((acc, time) => {
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top 5 most common times
  const commonMeetingTimes = Object.entries(timeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([time]) => time);

  // Calculate average duration
  const durations = events.map(e => {
    const start = new Date(e.startDate).getTime();
    const end = new Date(e.endDate).getTime();
    return (end - start) / (1000 * 60); // Duration in minutes
  });

  const averageMeetingDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 60; // Default to 60 minutes

  // Extract frequent attendees
  const attendeeCounts: Record<string, number> = {};
  events.forEach(event => {
    if (event.attendees && event.attendees.length > 0) {
      event.attendees.forEach(attendee => {
        attendeeCounts[attendee] = (attendeeCounts[attendee] || 0) + 1;
      });
    }
  });

  // Get top 10 most frequent attendees
  const frequentAttendees = Object.entries(attendeeCounts)
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

  // Get preferred categories (those used more than once)
  const preferredCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 1)
    .map(([category]) => category);

  // Calculate meeting frequency
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const weeklyEvents = events.filter(e => new Date(e.startDate) >= oneWeekAgo).length;
  const dailyEvents = events.filter(e => new Date(e.startDate) >= oneDayAgo).length;

  // Create and save the pattern
  const newPattern = new UserPattern({
    userId,
    commonMeetingTimes,
    averageMeetingDuration,
    frequentAttendees,
    preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['meeting'],
    meetingFrequency: {
      daily: dailyEvents,
      weekly: weeklyEvents,
    },
    lastUpdated: new Date(),
  });

  await newPattern.save();
  return newPattern;
}

// POST update user patterns (optional - for manual updates)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await request.json();
    
    // Fetch recent events
    const events = await Event.find({ userId })
      .sort({ startDate: -1 })
      .limit(100);

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No events found for user' },
        { status: 404 }
      );
    }

    // Update or create pattern
    let pattern = await UserPattern.findOne({ userId });
    
    if (pattern) {
      // Update existing pattern
      await pattern.updatePatterns(events);
    } else {
      // Create new pattern
      pattern = await analyzeAndCreatePattern(userId, events);
    }

    return NextResponse.json({ 
      success: true, 
      pattern 
    });
  } catch (error) {
    console.error('Update patterns error:', error);
    return NextResponse.json(
      { error: 'Failed to update patterns' },
      { status: 500 }
    );
  }
}