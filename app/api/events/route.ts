// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import Event from '../../../models/Event';
import Notification from '../../../models/Notification';
import { EventSchema } from '../../lib/types';
import { format } from 'date-fns';

// Define query type
interface EventQuery {
  userId: string;
  startDate?: { $gte: Date };
  endDate?: { $lte: Date };
}

// GET all events or events in a date range
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default-user';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: EventQuery = { userId };

    // Optional date range filter
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const events = await Event.find(query).sort({ startDate: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId = 'default-user', ...eventData } = body;

    // Convert date strings to Date objects before validation
    const dataWithDates = {
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
    };

    // Validate event data
    const validatedData = EventSchema.parse(dataWithDates);

    const event = await Event.create({
      userId,
      ...validatedData,
    });

    // Create a notification for the event creation
    await Notification.create({
      userId,
      eventId: event._id.toString(),
      type: 'created',
      title: 'Event Created',
      message: `${event.title} scheduled for ${format(new Date(event.startDate), 'MMM d, h:mm a')}`,
      read: false,
      sent: true, // Mark as sent since it's an instant notification
    });

    // Schedule a reminder notification (15 minutes before the event)
    const reminderTime = new Date(event.startDate);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15);

    // Only create reminder if the event is in the future
    if (reminderTime > new Date()) {
      await Notification.create({
        userId,
        eventId: event._id.toString(),
        type: 'reminder',
        title: `Upcoming: ${event.title}`,
        message: `Starting in 15 minutes${event.location ? ` at ${event.location}` : ''}`,
        read: false,
        sent: false,
        scheduledFor: reminderTime,
      });
    }

    // If the event has attendees, you could also send them notifications
    if (event.attendees && event.attendees.length > 0) {
      // This is where you'd implement attendee notifications
      // For now, we'll just log it
      console.log(`Event created with attendees: ${event.attendees.join(', ')}`);
    }

    return NextResponse.json(
      { 
        success: true, 
        event,
        notification: {
          message: 'Event created successfully! You will receive a reminder 15 minutes before the event.',
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}