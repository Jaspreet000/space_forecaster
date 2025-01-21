"use client";
import SpaceBackground from "@/components/SpaceBackground";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  getAstronomyPictureOfDay,
  type APOD,
  type AstronomicalEvent,
} from "@/services/api";

// Import 3D components dynamically with no SSR
const StarField = dynamic(() => import("@/components/StarField"), {
  ssr: false,
  loading: () => null,
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const EventCard = ({ event }: { event: AstronomicalEvent }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/20"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold">
        {event.name || event.type.charAt(0).toUpperCase() + event.type.slice(1)}
      </h3>
      <span className="text-sm text-gray-400">{formatDate(event.date)}</span>
    </div>
    <p className="text-gray-300">{event.description}</p>
    {event.intensity && (
      <div className="mt-4">
        <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300">
          Intensity: {event.intensity}
        </span>
      </div>
    )}
  </motion.div>
);

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [apod, setApod] = useState<APOD | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data with correct event types
        const mockEvents: AstronomicalEvent[] = [
          {
            type: "meteor",
            name: "Lyrids Meteor Shower",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            description:
              "The Lyrids meteor shower will be visible from the Northern Hemisphere",
            intensity: "Medium",
          },
          {
            type: "eclipse",
            name: "Partial Solar Eclipse",
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            description:
              "A partial solar eclipse will be visible from parts of South America",
            intensity: "High",
          },
          {
            type: "conjunction",
            name: "Venus-Jupiter Conjunction",
            date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            description:
              "Venus and Jupiter will appear close together in the evening sky",
          },
        ];

        try {
          const apodData = await getAstronomyPictureOfDay();
          setApod(apodData);
        } catch (error) {
          console.error("Error fetching APOD:", error);
          // Don't let APOD error prevent showing events
        }

        setEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching astronomical data:", error);
        // Don't set error state as we're using mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Star Field Background */}
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      <SpaceBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Astronomical Events
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Astronomy Picture of the Day */}
              {apod && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/20"
                >
                  <div className="aspect-video relative">
                    <Image
                      src={apod.url}
                      alt={apod.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">
                      Astronomy Picture of the Day
                    </h2>
                    <h3 className="text-xl text-purple-300 mb-4">
                      {apod.title}
                    </h3>
                    <p className="text-gray-300">{apod.explanation}</p>
                  </div>
                </motion.div>
              )}

              {/* Upcoming Events */}
              <div className="grid gap-6 md:grid-cols-2">
                {events.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>

              {events.length === 0 && (
                <div className="text-center p-8 bg-purple-900/20 rounded-xl">
                  <p className="text-gray-300">No upcoming events found</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 p-8 rounded-xl max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {selectedEvent.name ||
                  selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400">Date</p>
                  <p>{format(new Date(selectedEvent.date), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="capitalize">{selectedEvent.type}</p>
                </div>
                {selectedEvent.intensity && (
                  <div>
                    <p className="text-gray-400">Intensity</p>
                    <p>{selectedEvent.intensity}</p>
                  </div>
                )}
              </div>
              <p className="text-gray-300 mb-6">{selectedEvent.description}</p>
              <button
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
