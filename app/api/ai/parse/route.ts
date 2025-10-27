// app/api/ai/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from '../../../lib/ollama'; 
import { CALENDAR_PROMPTS } from '../../../../prompts/calendar-prompts';
import { parseDateTime, calculateEndDate } from '../../../lib/utils';
import { EventSchema } from '../../../lib/types';

// Define interface for parsed data
interface ParsedEventData {
  title?: string;
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  attendees?: string[];
  category?: string;
  description?: string;
  confidence?: number;
}

// Type for valid categories
type EventCategory = 'meeting' | 'task' | 'reminder' | 'personal' | 'work';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    console.log('Received input:', input);

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      );
    }

    const isOllamaRunning = await ollama.healthCheck();
    console.log('Ollama running:', isOllamaRunning);
    
    if (!isOllamaRunning) {
      return NextResponse.json(
        { error: 'Ollama is not running. Please start Ollama first.' },
        { status: 503 }
      );
    }

    const prompt = CALENDAR_PROMPTS.parseEvent(input);
    console.log('Generated prompt:', prompt.substring(0, 200) + '...'); // Log first 200 chars
    
    // Use llama2 since that's what you have installed
    const parsedData = await ollama.generateJSON(prompt, 'llama2') as ParsedEventData;
    console.log('Parsed data:', parsedData);
    
    const startDate = parseDateTime(parsedData.date, parsedData.time);
    const duration = parsedData.duration || 60; // Default 1 hour
    const endDate = calculateEndDate(startDate, duration);

    // Validate category or use default
    const validCategories: EventCategory[] = ['meeting', 'task', 'reminder', 'personal', 'work'];
    const category = parsedData.category && validCategories.includes(parsedData.category as EventCategory) 
      ? (parsedData.category as EventCategory)
      : 'meeting';

    const eventData = {
      title: parsedData.title || 'Untitled Event',
      description: parsedData.description,
      startDate,
      endDate,
      location: parsedData.location,
      attendees: parsedData.attendees || [],
      category,
      priority: 'medium' as const, 
      isRecurring: false,
    };

    console.log('Event data before validation:', eventData);

    const validatedEvent = EventSchema.parse(eventData);

    return NextResponse.json({
      success: true,
      event: validatedEvent,
      confidence: parsedData.confidence || 0.8,
      originalInput: input,
    });
  } catch (error) {
    console.error('Parse route error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse input', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}