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
  peakTime: string;
  duration: string;
  imageUrl: string;
  details: EventDetails;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/astronomical-events");
        setEvents(response.data);
      } catch (error) {
        setError("Failed to load astronomical events");
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
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
            onClick={() => setSelectedEvent(event)}
            className="cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
                  {new Date(event.date).toLocaleDateString()}{" "}
                  {event.peakTime && `at ${event.peakTime}`}
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
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              layoutId={`card-${selectedEvent.date}-${selectedEvent.title}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-96">
                <Image
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
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
                  {new Date(selectedEvent.date).toLocaleDateString()}{" "}
                  {selectedEvent.peakTime && `at ${selectedEvent.peakTime}`}
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{selectedEvent.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Location & Duration
                    </h3>
                    <p className="text-gray-300">
                      Visible from: {selectedEvent.location}
                    </p>
                    <p className="text-gray-300">
                      Duration: {selectedEvent.duration}
                    </p>
                  </div>
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
                    <h3 className="text-xl font-semibold mb-2">Significance</h3>
                    <p className="text-gray-300">
                      {selectedEvent.details.significance}
                    </p>
                  </div>
                  {selectedEvent.details.relatedEvents.length > 0 && (
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
