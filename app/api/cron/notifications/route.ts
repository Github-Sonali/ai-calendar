// app/api/cron/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Notification from '../../../../models/Notification';
import Event from '../../../../models/Event';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by your cron service (Vercel Cron, etc.)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all unsent notifications that should be sent now
    const now = new Date();
    const notifications = await Notification.find({
      sent: false,
      scheduledFor: { $lte: now }
    }).populate('eventId');

    // Process each notification
    for (const notification of notifications) {
      // Here you would send the actual notification
      // Options: Email, SMS, Push notification service, etc.
      
      console.log(`Sending notification: ${notification.title}`);
      
      // Mark as sent
      notification.sent = true;
      await notification.save();
    }

    return NextResponse.json({ 
      success: true, 
      processed: notifications.length 
    });
  } catch (error) {
    console.error('Cron notification error:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}