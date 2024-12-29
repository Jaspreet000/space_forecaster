const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
const ASTRONOMY_API_ID = process.env.NEXT_PUBLIC_ASTRONOMY_API_ID;
const ASTRONOMY_API_SECRET = process.env.NEXT_PUBLIC_ASTRONOMY_API_SECRET;

interface NasaApodResponse {
  date: string;
  explanation: string;
  title: string;
  url: string;
}

interface AstronomyApiEvent {
  type: string;
  startTime: string;
  endTime: string;
  description: string;
  magnitude?: number;
}

// Export the interface
export interface AstronomicalEvent {
  id: string;
  title: string;
  type: "meteor" | "eclipse" | "conjunction" | "other";
  date: string;
  description: string;
  visibility?: string;
  peak_time?: string;
  intensity?: string;
}

export async function fetchAstronomicalEvents(): Promise<AstronomicalEvent[]> {
  try {
    const events: AstronomicalEvent[] = [];
    
    // Fetch NASA APOD data
    const nasaResponse = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=5`
    );
    const nasaData: NasaApodResponse[] = await nasaResponse.json();
    
    // Add NASA data to events with explicit type casting
    events.push(
      ...nasaData.map((item, index): AstronomicalEvent => ({
        id: `nasa-${index}`,
        title: item.title,
        type: "other" as const,  // Explicitly type as literal
        date: item.date,
        description: item.explanation.substring(0, 200) + "...",
        visibility: "Varies"
      }))
    );

    // Get current date in required format
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Get events for next 3 months

    // Fetch Astronomy API data
    const astronomyResponse = await fetch(
      "https://api.astronomyapi.com/api/v2/studio/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${ASTRONOMY_API_ID}:${ASTRONOMY_API_SECRET}`)
      },
      body: JSON.stringify({
        format: "json",
        from_date: today.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0],
        longitude: 0, // Default to Greenwich
        latitude: 0,
        elevation: 0
      })
    });

    const astronomyData = await astronomyResponse.json();

    // Add Astronomy API data to events
    if (astronomyData.data && Array.isArray(astronomyData.data)) {
      events.push(
        ...astronomyData.data.map((event: AstronomyApiEvent, index): AstronomicalEvent => {
          const eventType = event.type.includes('METEOR') ? 'meteor' as const : 
                          event.type.includes('ECLIPSE') ? 'eclipse' as const : 
                          event.type.includes('CONJUNCTION') ? 'conjunction' as const : 
                          'other' as const;
          
          return {
            id: `astronomy-${index}`,
            title: event.type.replace(/_/g, ' ').split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            type: eventType,
            date: event.startTime.split('T')[0],
            description: event.description,
            peak_time: event.startTime.split('T')[1].split('.')[0],
            visibility: event.magnitude ? 
              event.magnitude < 3 ? "Excellent" :
              event.magnitude < 5 ? "Good" :
              "Fair" : "Varies"
          };
        })
      );
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return events;
  } catch (error) {
    console.error("Error fetching astronomical events:", error);
    return [];
  }
}

export async function fetchSpaceWeather() {
  try {
    const response = await fetch(
      'https://api.nasa.gov/DONKI/notifications' +
      `?api_key=${NASA_API_KEY}&type=all`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching space weather:", error);
    return [];
  }
} 