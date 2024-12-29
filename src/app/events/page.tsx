"use client";
import SpaceBackground from "@/components/SpaceBackground";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchAstronomicalEvents } from "@/services/astronomyApi";

interface AstronomicalEvent {
  id: string;
  title: string;
  type: "meteor" | "eclipse" | "conjunction" | "other";
  date: string;
  description: string;
  intensity?: string;
  visibility?: string;
  peak_time?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AstronomicalEvent | null>(
    null
  );
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let fetchedEvents = await fetchAstronomicalEvents();

        // Apply filters
        if (filter !== "all") {
          fetchedEvents = fetchedEvents.filter(
            (event) => event.type === filter
          );
        }

        if (dateRange !== "all") {
          const today = new Date();
          const oneMonth = new Date(today.setMonth(today.getMonth() + 1));
          const oneYear = new Date(today.setFullYear(today.getFullYear() + 1));

          fetchedEvents = fetchedEvents.filter((event) => {
            const eventDate = new Date(event.date);
            switch (dateRange) {
              case "month":
                return eventDate <= oneMonth;
              case "year":
                return eventDate <= oneYear;
              case "upcoming":
              default:
                return eventDate >= today;
            }
          });
        }

        // Sort by date
        fetchedEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setEvents(fetchedEvents);
      } catch (error: unknown) {
        setError(
          "Failed to fetch astronomical events. Please try again later."
        );
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filter, dateRange]);

  return (
    <div className="min-h-screen bg-black text-white">
      <SpaceBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        >
          Astronomical Events
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <select
            className="bg-purple-900/50 border border-purple-500/20 rounded-lg px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="meteor">Meteor Showers</option>
            <option value="eclipse">Eclipses</option>
            <option value="conjunction">Conjunctions</option>
          </select>

          <select
            className="bg-purple-900/50 border border-purple-500/20 rounded-lg px-4 py-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="upcoming">Upcoming</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm 
                          border border-purple-500/20 rounded-xl p-6 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-300 mb-4">
                  {format(new Date(event.date), "MMMM dd, yyyy")}
                </p>
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 bg-purple-500/20 rounded-full text-sm">
                    {event.type}
                  </span>
                  {event.visibility && (
                    <span className="px-2 py-1 bg-blue-500/20 rounded-full text-sm">
                      {event.visibility}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{event.description}</p>
              </motion.div>
            ))}
          </div>
        )}

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
              <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400">Date</p>
                  <p>{format(new Date(selectedEvent.date), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-400">Peak Time</p>
                  <p>{selectedEvent.peak_time}</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="capitalize">{selectedEvent.type}</p>
                </div>
                <div>
                  <p className="text-gray-400">Visibility</p>
                  <p>{selectedEvent.visibility}</p>
                </div>
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
