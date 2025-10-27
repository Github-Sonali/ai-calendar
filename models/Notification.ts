// app/models/Notification.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  eventId: string;
  type: 'reminder' | 'created' | 'updated' | 'cancelled';
  title: string;
  message: string;
  read: boolean;
  scheduledFor?: Date;
  sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['reminder', 'created', 'updated', 'cancelled'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  scheduledFor: {
    type: Date,
    index: true,
  },
  sent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for fetching unsent notifications
NotificationSchema.index({ sent: 1, scheduledFor: 1 });

export default mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', NotificationSchema);