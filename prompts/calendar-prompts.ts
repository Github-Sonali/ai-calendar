// app/prompts/calendar-prompts.ts
// Structured prompts for consistent AI responses

// Define the UserPattern interface for typing
interface UserPatterns {
  commonMeetingTimes: string[];
  averageMeetingDuration: number;
  frequentAttendees: string[];
  preferredCategories?: string[];
}

export const CALENDAR_PROMPTS = {
  /**
   * Parse natural language into calendar event
   */
  parseEvent: (input: string) => `
You are a calendar assistant. Parse the following natural language input into calendar event details.

Input: "${input}"

Extract the following information:
- title: The event title/subject
- date: The date (if mentioned) in ISO format (YYYY-MM-DD)
- time: The time (if mentioned) in 24-hour format (HH:MM)
- duration: How long the event lasts (in minutes, as a number)
- location: Where the event takes place
- attendees: List of people attending (as array)
- category: One of [meeting, task, reminder, personal, work]
- description: Any additional details

If information is not provided, use these defaults:
- date: today's date (${new Date().toISOString().split('T')[0]})
- time: "09:00"
- duration: 60
- category: "meeting"

Example response format:
{
  "title": "Team Meeting",
  "date": "2024-10-26",
  "time": "14:00",
  "duration": 60,
  "location": "Conference Room",
  "attendees": ["John", "Sarah"],
  "category": "meeting",
  "description": "Weekly team sync",
  "confidence": 0.95
}

IMPORTANT: Respond ONLY with valid JSON. No explanatory text before or after. No markdown formatting. Just the raw JSON object.`,

  /**
   * Suggest optimal meeting time based on patterns
   */
  suggestTime: (eventType: string, patterns: UserPatterns) => `
Based on the user's calendar patterns, suggest the best time for a ${eventType}.

User patterns:
- Common meeting times: ${patterns.commonMeetingTimes.join(', ')}
- Average meeting duration: ${patterns.averageMeetingDuration} minutes
- Frequent attendees: ${patterns.frequentAttendees.join(', ')}

Suggest 3 optimal time slots for the next 7 days.
Consider work hours (9 AM - 5 PM) and avoid lunch time (12 PM - 1 PM).

Example response format:
{
  "suggestions": [
    {
      "date": "2024-10-27",
      "time": "10:00",
      "reason": "Morning slot aligns with your usual meeting pattern"
    },
    {
      "date": "2024-10-28",
      "time": "14:00",
      "reason": "Post-lunch slot with good availability"
    },
    {
      "date": "2024-10-29",
      "time": "15:30",
      "reason": "Late afternoon matches your productivity pattern"
    }
  ]
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`,

  /**
   * Categorize and prioritize events
   */
  categorizeEvent: (title: string, description: string) => `
Analyze this calendar event and determine its category and priority.

Title: "${title}"
Description: "${description}"

Categories: meeting, task, reminder, personal, work
Priority levels: low, medium, high

Consider:
- Keywords indicating urgency (urgent, ASAP, important)
- Meeting types (standup, review, 1-on-1)
- Personal vs professional context

Example response:
{
  "category": "meeting",
  "priority": "high",
  "reasoning": "Client meeting indicates high priority business interaction"
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`,

  /**
   * Extract recurring pattern from natural language
   */
  parseRecurringEvent: (input: string) => `
Parse this natural language input for recurring event patterns.

Input: "${input}"

Identify:
- Recurrence pattern (daily, weekly, monthly, custom)
- Days of week (if weekly)
- Day of month (if monthly)
- End date or number of occurrences
- Time and duration

Examples:
- "every Monday at 9am" → weekly on Monday
- "daily standup at 10am for 15 minutes" → daily
- "team meeting every other Tuesday" → bi-weekly

Example response:
{
  "isRecurring": true,
  "pattern": "weekly",
  "daysOfWeek": ["monday"],
  "time": "09:00",
  "duration": 60,
  "endDate": null,
  "occurrences": null
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`,

  /**
   * Generate event summary
   */
  summarizeEvents: (events: Array<{ title: string; startDate: string; category: string }>) => `
Summarize these calendar events for a daily brief:

Events:
${events.map(e => `- ${e.title} at ${e.startDate} (${e.category})`).join('\n')}

Create a brief, natural summary highlighting:
- Key meetings or deadlines
- Time blocks for focused work
- Any conflicts or busy periods

Keep it concise and actionable.

Example response:
{
  "summary": "You have 3 meetings today starting with the team standup at 9 AM. Your afternoon is blocked for focused work from 2-5 PM. Remember to prepare for the client presentation at 3 PM.",
  "keyPoints": ["Team standup at 9 AM", "Client presentation at 3 PM", "Focus time 2-5 PM"],
  "conflicts": []
}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`,
};

// Export the UserPatterns type if needed elsewhere
export type { UserPatterns };