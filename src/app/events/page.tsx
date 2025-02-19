"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface EventDetails {
  phenomenon: string;
  viewingGuide: string;
  significance: string;
  relatedEvents: string[];
}

interface AdditionalInfo {
  equipment: string[];
  weatherConditions: string;
  historicalContext: string;
  scientificImportance: string;
}

interface AstronomicalEvent {
  date: string;
  title: string;
  type:
    | "meteor"
    | "eclipse"
    | "conjunction"
    | "transit"
    | "occultation"
    | "other";
  description: string;
  location: string;
  imageUrl: string;
  peakTime?: string;
  duration?: string;
  details?: EventDetails;
  additionalInfo?: AdditionalInfo;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clickedEventId, setClickedEventId] = useState<string | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/astronomical-events");
        setEvents(response.data);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        setError("Failed to load astronomical events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const fetchEventDetails = async (event: AstronomicalEvent) => {
    try {
      setLoadingDetails(true);
      const eventId = encodeURIComponent(`${event.title}---${event.date}`);
      const response = await axios.get(`/api/astronomical-events/${eventId}`);

      // Merge the details with the existing event data
      const updatedEvent = {
        ...event,
        ...response.data,
      };

      // Update the event in the events array
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.title === event.title && e.date === event.date ? updatedEvent : e
        )
      );

      setSelectedEvent(updatedEvent);
    } catch (error) {
      console.error("Error fetching event details:", error);
      // Still show the event with basic info if details fetch fails
      setSelectedEvent(event);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEventClick = (event: AstronomicalEvent) => {
    setClickedEventId(`${event.date}-${event.title}`);
    if (!event.details) {
      fetchEventDetails(event);
    } else {
      setSelectedEvent(event);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meteor: "from-orange-500 to-red-600",
      eclipse: "from-purple-500 to-indigo-600",
      conjunction: "from-blue-500 to-cyan-600",
      transit: "from-green-500 to-emerald-600",
      occultation: "from-pink-500 to-rose-600",
      other: "from-gray-500 to-slate-600",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const handleVideoError = (eventType: string) => {
    setVideoErrors((prev) => ({ ...prev, [eventType]: true }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-gray-400">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="text-red-500 text-xl text-center max-w-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Upcoming Astronomical Events
      </h1>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div
            key={`${event.date}-${event.title}`}
            layoutId={`card-${event.date}-${event.title}`}
            onClick={() => handleEventClick(event)}
            className="cursor-pointer group relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative h-64 rounded-xl overflow-hidden">
              {!videoErrors[event.type] ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => handleVideoError(event.type)}
                >
                  <source src={`/events/${event.type}.mp4`} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {clickedEventId === `${event.date}-${event.title}` &&
                !event.details && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-gradient-to-r ${getEventTypeColor(
                    event.type
                  )} text-white`}
                >
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-200">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedEvent(null);
              setClickedEventId(null);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              layoutId={`card-${selectedEvent.date}-${selectedEvent.title}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-96">
                {!videoErrors[selectedEvent.type] ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => handleVideoError(selectedEvent.type)}
                  >
                    <source
                      src={`/events/${selectedEvent.type}.mp4`}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <Image
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r ${getEventTypeColor(
                    selectedEvent.type
                  )} text-white`}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedEvent.title}
                </h2>
                <p className="text-gray-400 mb-4">
                  {new Date(selectedEvent.date).toLocaleDateString()}
                  {selectedEvent.peakTime && ` at ${selectedEvent.peakTime}`}
                </p>

                {loadingDetails ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Description
                      </h3>
                      <p className="text-gray-300">
                        {selectedEvent.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Location & Duration
                      </h3>
                      <p className="text-gray-300">
                        Visible from: {selectedEvent.location}
                      </p>
                      {selectedEvent.duration && (
                        <p className="text-gray-300">
                          Duration: {selectedEvent.duration}
                        </p>
                      )}
                    </div>
                    {selectedEvent.details && (
                      <>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            How It Occurs
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.details.phenomenon}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Viewing Guide
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.details.viewingGuide}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Significance
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.details.significance}
                          </p>
                        </div>
                      </>
                    )}
                    {selectedEvent.additionalInfo && (
                      <>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Required Equipment
                          </h3>
                          <ul className="list-disc list-inside text-gray-300">
                            {selectedEvent.additionalInfo.equipment.map(
                              (item, index) => (
                                <li key={index}>{item}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Ideal Weather Conditions
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.additionalInfo.weatherConditions}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Historical Context
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.additionalInfo.historicalContext}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Scientific Importance
                          </h3>
                          <p className="text-gray-300">
                            {selectedEvent.additionalInfo.scientificImportance}
                          </p>
                        </div>
                      </>
                    )}
                    {selectedEvent.details &&
                      selectedEvent.details.relatedEvents &&
                      selectedEvent.details.relatedEvents.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Related Events
                          </h3>
                          <ul className="list-disc list-inside text-gray-300">
                            {selectedEvent.details.relatedEvents.map(
                              (event, index) => (
                                <li key={index}>{event}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
