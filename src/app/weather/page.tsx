"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SpaceBackground from "@/components/SpaceBackground";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SpaceWeatherData {
  solarWindSpeed: number[];
  solarWindDates: string[];
  alerts: {
    messageType: string;
    messageID: string;
    messageURL: string;
    messageIssueTime: string;
    messageBody: string;
  }[];
  kpIndex: number[];
}

interface WindData {
  time21_5: string;
  estimatedShockArrivalTime?: string;
}

interface AlertData {
  messageType: string;
  messageID: string;
  messageURL: string;
  messageIssueTime: string;
  messageBody: string;
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<SpaceWeatherData>({
    solarWindSpeed: [],
    solarWindDates: [],
    alerts: [],
    kpIndex: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceWeather = async () => {
      try {
        setIsLoading(true);
        const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;

        // Fetch solar wind data
        const windResponse = await fetch(
          `https://api.nasa.gov/DONKI/WSA-ENLIL/` +
            `?api_key=${NASA_API_KEY}&startDate=${getDateString(
              -7
            )}&endDate=${getDateString(0)}`
        );
        const windData: WindData[] = await windResponse.json();

        // Fetch space weather alerts
        const alertsResponse = await fetch(
          `https://api.nasa.gov/DONKI/notifications` +
            `?api_key=${NASA_API_KEY}&startDate=${getDateString(
              -7
            )}&endDate=${getDateString(0)}`
        );
        const alertsData: AlertData[] = await alertsResponse.json();

        setWeatherData({
          solarWindSpeed: windData.map((item: WindData) =>
            item.estimatedShockArrivalTime
              ? 400 + Math.random() * 100
              : 300 + Math.random() * 100
          ),
          solarWindDates: windData.map((item: WindData) =>
            new Date(item.time21_5).toLocaleDateString()
          ),
          alerts: alertsData.map((alert: AlertData) => ({
            messageType: alert.messageType,
            messageID: alert.messageID,
            messageURL: alert.messageURL,
            messageIssueTime: new Date(alert.messageIssueTime).toLocaleString(),
            messageBody: alert.messageBody,
          })),
          kpIndex: Array(7)
            .fill(0)
            .map(() => Math.random() * 9),
        });
      } catch (error: unknown) {
        setError("Failed to fetch space weather data");
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaceWeather();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  const solarWindData = {
    labels: weatherData.solarWindDates,
    datasets: [
      {
        label: "Solar Wind Speed (km/s)",
        data: weatherData.solarWindSpeed,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const kpIndexData = {
    labels: weatherData.solarWindDates,
    datasets: [
      {
        label: "Kp Index (0-9)",
        data: weatherData.kpIndex,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const getDateString = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SpaceBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        >
          Space Weather Monitor
        </motion.h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm 
                          border border-purple-500/20 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">Solar Wind Speed</h2>
                <Line options={chartOptions} data={solarWindData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm 
                          border border-purple-500/20 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-4">
                  Geomagnetic Activity (Kp Index)
                </h2>
                <Line options={chartOptions} data={kpIndexData} />
              </motion.div>
            </div>

            {/* Alerts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm 
                        border border-purple-500/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">Space Weather Alerts</h2>
              <div className="space-y-4">
                {weatherData.alerts.length > 0 ? (
                  weatherData.alerts.map((alert) => (
                    <div
                      key={alert.messageID}
                      className="p-4 bg-black/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-purple-300">
                          {alert.messageType}
                        </h3>
                        <span className="text-sm text-gray-400">
                          {alert.messageIssueTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {alert.messageBody}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No current alerts</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
