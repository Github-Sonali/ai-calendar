// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import Notification from '../../../models/Notification';

// Define query type
interface NotificationQuery {
  userId: string;
  read?: boolean;
}

// GET user notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default-user';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: NotificationQuery = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Define request body type for POST
interface MarkAsReadRequest {
  notificationIds: string[];
}

// POST mark as read
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: MarkAsReadRequest = await request.json();
    const { notificationIds } = body;

    // Validate that notificationIds is an array
    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}