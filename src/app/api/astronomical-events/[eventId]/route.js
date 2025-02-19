import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function GET(request, context) {
  try {
    const eventId = decodeURIComponent(context.params.eventId);
    const [title, date] = eventId.split("---");

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Provide detailed information about the astronomical event "${title}" occurring on ${date}. Include only factual, accurate information in this JSON format:
    {
      "peakTime": "Specific peak viewing time",
      "duration": "Event duration",
      "details": {
        "phenomenon": "Detailed scientific explanation of how it occurs",
        "viewingGuide": "Practical viewing instructions including equipment needed and best viewing conditions",
        "significance": "Scientific and historical significance of this event",
        "relatedEvents": ["List of 2-3 related astronomical events"]
      },
      "additionalInfo": {
        "equipment": ["List of recommended viewing equipment"],
        "weatherConditions": "Ideal weather conditions for viewing",
        "historicalContext": "Brief historical context or previous notable occurrences",
        "scientificImportance": "Scientific research value or discoveries associated with this type of event"
      }
    }`;

    console.log("Sending prompt to Gemini:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw Gemini response:", text);

    // Clean and parse the response
    const cleanedJson = text.replace(/```json\s*|\s*```/g, "").trim();
    console.log("Cleaned JSON:", cleanedJson);

    const eventDetails = JSON.parse(cleanedJson);
    console.log("Parsed event details:", eventDetails);

    return NextResponse.json(eventDetails);
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
