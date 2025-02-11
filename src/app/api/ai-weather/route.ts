import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function getAIWeatherInsights(planet: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate current weather conditions and atmospheric phenomena for ${planet} based on scientific data. Return only a JSON object with this exact structure (no markdown, no explanation, just the JSON):
{
  "temperature": {
    "average": "string with average temperature",
    "range": "string with temperature range"
  },
  "atmosphere": {
    "composition": ["array of strings with main gases"],
    "pressure": "string describing atmospheric pressure"
  },
  "phenomena": ["array of strings describing weather phenomena"],
  "seasons": "string describing seasonal changes",
  "facts": ["array of interesting weather facts"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      const parsedData = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!parsedData.temperature || !parsedData.atmosphere || !Array.isArray(parsedData.phenomena) || !parsedData.seasons || !Array.isArray(parsedData.facts)) {
        throw new Error('Invalid data structure');
      }
      
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return a fallback response
      return {
        temperature: {
          average: `Average temperature data for ${planet} unavailable`,
          range: `Temperature range for ${planet} unavailable`
        },
        atmosphere: {
          composition: [`Main atmospheric components of ${planet} unavailable`],
          pressure: `Atmospheric pressure data for ${planet} unavailable`
        },
        phenomena: [`Weather phenomena on ${planet} unavailable`],
        seasons: `Seasonal changes on ${planet} unavailable`,
        facts: [`Weather facts about ${planet} unavailable`]
      };
    }
  } catch (error) {
    console.error('Error generating AI weather insights:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planet = searchParams.get('planet');

  if (!planet) {
    return NextResponse.json({ error: 'Planet parameter is required' }, { status: 400 });
  }

  try {
    const insights = await getAIWeatherInsights(planet);
    if (!insights) {
      return NextResponse.json({ error: 'Failed to generate weather insights' }, { status: 500 });
    }
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error in AI weather route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 