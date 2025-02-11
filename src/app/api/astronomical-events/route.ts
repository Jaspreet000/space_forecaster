import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Reliable NASA image URLs that work
const NASA_IMAGES = {
  meteor: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg",
  eclipse: "https://images-assets.nasa.gov/image/total-solar-eclipse-2017/total-solar-eclipse-2017~orig.jpg",
  conjunction: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg",
  transit: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg",
  occultation: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg",
  other: "https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg"
};

// Fallback data in case AI fails
const getFallbackEvents = () => {
  const currentYear = new Date().getFullYear();
  return [
    {
      date: `${currentYear}-08-12`,
      title: "Perseid Meteor Shower Peak",
      type: "meteor",
      description: "One of the best meteor showers of the year, producing up to 60 meteors per hour at its peak.",
      location: "Visible worldwide, best from Northern Hemisphere",
      peakTime: "Pre-dawn hours",
      duration: "July 17 - August 24",
      imageUrl: NASA_IMAGES.meteor,
      details: {
        phenomenon: "The Perseid meteor shower occurs when Earth passes through debris left by the Swift-Tuttle comet.",
        viewingGuide: "Find a dark location away from city lights. Best viewing is after midnight until dawn.",
        significance: "One of the most popular meteor showers due to its high rate and warm summer viewing.",
        relatedEvents: ["Geminids Meteor Shower", "Leonids Meteor Shower"]
      }
    },
    {
      date: `${currentYear}-12-14`,
      title: "Geminid Meteor Shower Peak",
      type: "meteor",
      description: "The king of meteor showers, producing up to 120 multicolored meteors per hour at its peak.",
      location: "Visible worldwide",
      peakTime: "Around 2 AM local time",
      duration: "December 4-17",
      imageUrl: NASA_IMAGES.meteor,
      details: {
        phenomenon: "The Geminid meteor shower is caused by debris left by asteroid 3200 Phaethon.",
        viewingGuide: "Find a dark location away from city lights. No special equipment needed.",
        significance: "Unique for being caused by an asteroid rather than a comet.",
        relatedEvents: ["Perseid Meteor Shower", "Quadrantids Meteor Shower"]
      }
    },
    {
      date: `${currentYear + 1}-04-08`,
      title: "Total Solar Eclipse",
      type: "eclipse",
      description: "A total solar eclipse visible from parts of North America.",
      location: "Path of totality through Mexico, United States, and Canada",
      peakTime: "Varies by location",
      duration: "Up to 4 minutes of totality",
      imageUrl: NASA_IMAGES.eclipse,
      details: {
        phenomenon: "A total solar eclipse occurs when the Moon completely blocks the Sun's disk.",
        viewingGuide: "Must use certified eclipse glasses. Never look directly at the Sun.",
        significance: "One of nature's most spectacular events, revealing the Sun's corona.",
        relatedEvents: ["Partial Solar Eclipse", "Annular Solar Eclipse"]
      }
    }
  ];
};

async function getAstronomicalEvents() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const currentYear = new Date().getFullYear();

  const prompt = `Generate exactly 5 major astronomical events from ${currentYear} to ${currentYear + 2}. Format as a JSON array with this structure:
{
  "events": [
    {
      "date": "YYYY-MM-DD",
      "title": "Event Title",
      "type": "meteor",
      "description": "Brief description",
      "location": "Where visible",
      "peakTime": "Peak viewing time",
      "duration": "Event duration",
      "details": {
        "phenomenon": "How it occurs",
        "viewingGuide": "How to view",
        "significance": "Why important",
        "relatedEvents": ["Related event 1", "Related event 2"]
      }
    }
  ]
}

Include only these event types: meteor, eclipse, conjunction, transit, occultation.
Keep all text fields under 200 characters.
Focus on major events like meteor showers, eclipses, and planetary conjunctions.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      // Parse the response and extract events array
      const parsed = JSON.parse(text.replace(/```json\s*|\s*```/g, '').trim());
      const events = parsed.events || [];
      
      if (!Array.isArray(events) || events.length === 0) {
        console.log('No events in AI response, using fallback data');
        return getFallbackEvents();
      }

      // Validate and clean each event
      const validatedEvents = events.map(event => {
        try {
          const date = new Date(event.date);
          if (isNaN(date.getTime())) return null;

          const type = ['meteor', 'eclipse', 'conjunction', 'transit', 'occultation'].includes(event.type)
            ? event.type
            : 'other';

          return {
            ...event,
            date: date.toISOString().split('T')[0],
            type,
            imageUrl: NASA_IMAGES[type],
            details: {
              phenomenon: event.details?.phenomenon || 'Information not available',
              viewingGuide: event.details?.viewingGuide || 'Standard viewing practices apply',
              significance: event.details?.significance || 'Significant astronomical event',
              relatedEvents: Array.isArray(event.details?.relatedEvents) ? event.details.relatedEvents : []
            }
          };
        } catch (error) {
          console.error('Error validating event:', error);
          return null;
        }
      }).filter(Boolean);

      if (validatedEvents.length === 0) {
        console.log('No valid events after validation, using fallback data');
        return getFallbackEvents();
      }

      // Sort events by date
      return validatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return getFallbackEvents();
    }
  } catch (error) {
    console.error('Error generating astronomical events:', error);
    return getFallbackEvents();
  }
}

export async function GET() {
  try {
    const events = await getAstronomicalEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error in astronomical events route:', error);
    return NextResponse.json(getFallbackEvents());
  }
} 