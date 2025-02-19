import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Sample space-related Unsplash image IDs for different event types
const EVENT_IMAGES = {
  meteor: "1DckG9ZjLrU",  // Meteor shower image
  eclipse: "Yj1M5riCKk4", // Solar eclipse image
  conjunction: "ln5drpv_ImI", // Night sky with stars
  transit: "71u2fOofI-U", // Planet transit image
  occultation: "4dpAqfTbvKA", // Moon occultation image
  other: "9wg5jCEPBsw"  // General space image
};

async function fetchEventsFromGemini() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const currentYear = new Date().getFullYear();

  const prompt = `Generate a comprehensive list of astronomical events for ${currentYear}. Include all major astronomical events like meteor showers, eclipses, conjunctions, equinoxes, solstices, and other significant celestial events. Return as a JSON array with this structure for each event:
  {
    "date": "YYYY-MM-DD",
    "title": "Event Title",
    "type": "meteor|eclipse|conjunction|transit|occultation|other",
    "description": "A brief, engaging description of the event",
    "location": "Where the event will be visible from"
  }
  
  Important guidelines:
  - Include ALL major astronomical events for ${currentYear}
  - Include all major meteor showers
  - Include all eclipses (solar and lunar)
  - Include significant planetary conjunctions and alignments
  - Include seasonal events (equinoxes and solstices)
  - Include any rare or notable astronomical phenomena
  - Ensure dates are accurate for ${currentYear}
  - Types must be one of: meteor, eclipse, conjunction, transit, occultation, other
  - Descriptions should be concise but informative
  - Location should specify regions or worldwide visibility
  - Sort events chronologically by date`;

  console.log('Sending initial events prompt to Gemini:', prompt);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('Raw Gemini response for events:', text);

  // Clean the response text
  const cleanedJson = text.replace(/```json\s*|\s*```/g, '').trim();
  console.log('Cleaned JSON for events:', cleanedJson);

  const events = JSON.parse(cleanedJson);
  console.log('Parsed events:', events);

  if (!Array.isArray(events)) {
    throw new Error('Invalid response format: not an array');
  }

  // Validate and enhance each event
  return events.map(event => {
    if (!event.date || !event.title || !event.type || !event.description || !event.location) {
      throw new Error('Invalid event format: missing required fields');
    }

    // Ensure the type is valid and add image URL
    const validType = Object.keys(EVENT_IMAGES).includes(event.type) ? event.type : 'other';
    const imageId = EVENT_IMAGES[validType as keyof typeof EVENT_IMAGES];

    return {
      ...event,
      type: validType,
      imageUrl: `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1000&q=80`
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function GET() {
  try {
    const events = await fetchEventsFromGemini();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch astronomical events:", error);
    // If Gemini fails, use the hardcoded events as fallback
    const fallbackEvents = getBaseEvents();
    return NextResponse.json(fallbackEvents);
  }
}

// Fallback events in case of API failure
function getBaseEvents() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  
  const events = [
    {
      date: `${year}-04-08`,
      title: "Total Solar Eclipse",
      type: "eclipse",
      description: "A spectacular total solar eclipse visible across North America.",
      location: "North America",
    },
    {
      date: `${year}-08-12`,
      title: "Perseid Meteor Shower Peak",
      type: "meteor",
      description: "One of the best meteor showers of the year.",
      location: "Northern Hemisphere",
    },
    {
      date: `${year}-05-15`,
      title: "Lunar Eclipse",
      type: "eclipse",
      description: "A partial lunar eclipse visible from many parts of Earth.",
      location: "Asia, Australia, North America",
    },
    {
      date: `${year}-12-14`,
      title: "Geminid Meteor Shower",
      type: "meteor",
      description: "The king of meteor showers, producing up to 120 meteors per hour.",
      location: "Worldwide",
    },
    {
      date: `${year}-06-20`,
      title: "Summer Solstice",
      type: "other",
      description: "The longest day of the year in the Northern Hemisphere.",
      location: "Worldwide",
    },
    {
      date: `${year}-10-21`,
      title: "Orionid Meteor Shower",
      type: "meteor",
      description: "Annual meteor shower produced by Halley's Comet debris.",
      location: "Worldwide",
    },
    {
      date: `${year}-07-01`,
      title: "Venus-Mars Conjunction",
      type: "conjunction",
      description: "Close approach of Venus and Mars in the evening sky.",
      location: "Worldwide",
    },
    {
      date: `${year}-11-19`,
      title: "Leonid Meteor Shower",
      type: "meteor",
      description: "Fast and bright meteors with potential for meteor storms.",
      location: "Worldwide",
    },
    {
      date: `${year}-09-23`,
      title: "Autumnal Equinox",
      type: "other",
      description: "Equal day and night lengths, marking the start of autumn.",
      location: "Worldwide",
    }
  ];

  return events.map(event => ({
    ...event,
    imageUrl: `https://images.unsplash.com/photo-${EVENT_IMAGES[event.type as keyof typeof EVENT_IMAGES]}?auto=format&fit=crop&w=1000&q=80`
  }));
}

function cleanJsonString(str: string): string {
  str = str.replace(/^\uFEFF/, '');
  str = str.replace(/[^\x20-\x7E\s]/g, '');
  str = str.replace(/```json\s*|\s*```/g, '').trim();
  str = str.replace(/^JSON\s*/i, '').trim();
  str = str.replace(/\r?\n|\r/g, ' ');
  str = str.replace(/\s+/g, ' ');
  return str;
} 