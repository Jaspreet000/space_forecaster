"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
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
import { getSpaceWeather, type SpaceWeatherData } from "@/services/api";

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

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<SpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSpaceWeather();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching space weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: weatherData
      ? [new Date(weatherData.solarWind.timestamp).toLocaleTimeString()]
      : [],
    datasets: [
      {
        label: "Solar Wind Speed (km/s)",
        data: weatherData ? [weatherData.solarWind.speed] : [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">
          Space Weather Monitor
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Solar Wind Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-500/20"
            >
              <h2 className="text-2xl font-semibold mb-4">Solar Wind</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Current Speed</p>
                  <p className="text-3xl font-bold">
                    {weatherData?.solarWind.speed} km/s
                  </p>
                </div>
                <div className="h-64">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Geomagnetic Activity Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Geomagnetic Activity
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Kp Index</p>
                  <p className="text-3xl font-bold">
                    {weatherData?.geomagneticData.kpIndex}
                  </p>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl mb-2">Current Status</h3>
                  <div
                    className={`p-4 rounded-lg ${
                      (weatherData?.geomagneticData?.kpIndex ?? 0) <= 3
                        ? "bg-green-500/20 text-green-300"
                        : (weatherData?.geomagneticData?.kpIndex ?? 0) <= 5
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {(weatherData?.geomagneticData?.kpIndex ?? 0) <= 3
                      ? "Quiet"
                      : (weatherData?.geomagneticData?.kpIndex ?? 0) <= 5
                      ? "Active"
                      : "Storm"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2 p-6 rounded-xl bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-sm border border-cyan-500/20"
            >
              <h2 className="text-2xl font-semibold mb-4">
                Space Weather Alerts
              </h2>
              <div className="space-y-2">
                <p className="text-gray-300">
                  {(weatherData?.geomagneticData?.kpIndex ?? 0) >= 5
                    ? "⚠️ High geomagnetic activity detected. Aurora viewing conditions may be favorable."
                    : "No significant space weather alerts at this time."}
                </p>
                <p className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
