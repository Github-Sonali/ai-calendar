import mongoose, { Schema, Document } from 'mongoose';


export interface IEvent extends Document {
    userId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    attendees?: string[];
    category: 'meeting' | 'task' | 'reminder' | 'peronal' | 'work';
    priority: 'low' | 'medium' | 'high';
    isRecurring: boolean;
    recurringPattern?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
    userId: {
        type: String,
        required: true,
        index: true,    
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,     
    },
    startDate: {
        type: Date,
        required: true,
        index: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    location: String,
    attendees: [String],
    category: {
      type: String,
      enum: ['meeting', 'task', 'reminder', 'personal', 'work'],
      default: 'meeting',
    },
     priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: String,
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
});

// Compound index for efficient queries
EventSchema.index({ userId: 1, startDate: 1 });

// Method to check if event is happening now
EventSchema.methods.isHappeningNow = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Static method to find events in date range
EventSchema.statics.findInDateRange = function(userId: string, start: Date, end: Date) {
  return this.find({
    userId,
    startDate: { $gte: start },
    endDate: { $lte: end }
  }).sort({ startDate: 1 });
};

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);