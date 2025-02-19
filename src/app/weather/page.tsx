"use client";
import React from "react";
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
  ChartData,
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

// Define the details type
type PlanetDetails = {
  diameter: string;
  orbitalPeriod: string;
  gravity: string;
  distanceFromSun: string;
  surfaceTemp: {
    day?: string;
    night?: string;
    average?: string;
  };
  moons: number;
};

interface WeatherDisplayData {
  temperature?: {
    average: string;
    range: string;
  };
  atmosphere?: {
    composition: string[];
    pressure: string;
  };
  phenomena?: string[];
  seasons?: string;
  facts?: string[];
}

// Planet data with enhanced details
const planets = [
  {
    id: "mercury",
    name: "Mercury",
    description: "The Swift Planet",
    image: "/planets/mercury.jpg",
    color: "from-orange-600 to-red-800",
    facts: [
      "Closest planet to the Sun",
      "Extreme temperature variations",
      "No atmosphere to speak of",
    ],
    details: {
      diameter: "4,879 km",
      orbitalPeriod: "88 Earth days",
      gravity: "3.7 m/s²",
      distanceFromSun: "57.9 million km",
      surfaceTemp: {
        day: "430°C",
        night: "-180°C",
      },
      moons: 0,
    },
  },
  {
    id: "venus",
    name: "Venus",
    description: "The Morning Star",
    image: "/planets/venus.jpg",
    color: "from-yellow-500 to-orange-700",
    facts: [
      "Hottest planet in our solar system",
      "Thick atmosphere of CO2",
      "Rotates backwards",
    ],
    details: {
      diameter: "12,104 km",
      orbitalPeriod: "225 Earth days",
      gravity: "8.87 m/s²",
      distanceFromSun: "108.2 million km",
      surfaceTemp: {
        average: "462°C",
      },
      moons: 0,
    },
  },
  {
    id: "earth",
    name: "Earth",
    description: "The Blue Planet",
    image: "/planets/earth.jpg",
    color: "from-blue-500 to-green-700",
    facts: [
      "Only known planet with life",
      "71% covered by water",
      "Perfect conditions for life",
    ],
    details: {
      diameter: "12,742 km",
      orbitalPeriod: "365.25 Earth days",
      gravity: "9.81 m/s²",
      distanceFromSun: "149.6 million km",
      surfaceTemp: {
        day: "15°C",
        night: "-5°C",
        average: "14°C",
      },
      moons: 1,
    },
  },
  {
    id: "mars",
    name: "Mars",
    description: "The Red Planet",
    image: "/planets/mars.jpg",
    color: "from-red-600 to-orange-800",
    facts: [
      "Home to largest volcano",
      "Has two moons",
      "Evidence of ancient water",
    ],
    details: {
      diameter: "6,779 km",
      orbitalPeriod: "687 Earth days",
      gravity: "3.72 m/s²",
      distanceFromSun: "227.9 million km",
      surfaceTemp: {
        day: "20°C",
        night: "-73°C",
        average: "-63°C",
      },
      moons: 2,
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    description: "The Gas Giant",
    image: "/planets/jupiter.jpg",
    color: "from-orange-400 to-red-600",
    facts: [
      "Largest planet in our system",
      "Great Red Spot storm",
      "79 known moons",
    ],
    details: {
      diameter: "139,820 km",
      orbitalPeriod: "11.86 Earth years",
      gravity: "24.79 m/s²",
      distanceFromSun: "778.5 million km",
      surfaceTemp: {
        average: "-110°C",
      },
      moons: 79,
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    description: "The Ringed Planet",
    image: "/planets/saturn.jpg",
    color: "from-yellow-600 to-orange-800",
    facts: [
      "Famous for its rings",
      "Would float in water",
      "62 confirmed moons",
    ],
    details: {
      diameter: "116,460 km",
      orbitalPeriod: "29.45 Earth years",
      gravity: "10.44 m/s²",
      distanceFromSun: "1.434 billion km",
      surfaceTemp: {
        average: "-140°C",
      },
      moons: 62,
    },
  },
  {
    id: "uranus",
    name: "Uranus",
    description: "The Ice Giant",
    image: "/planets/uranus.jpg",
    color: "from-cyan-500 to-blue-700",
    facts: [
      "Rotates on its side",
      "27 known moons",
      "Coldest planetary atmosphere",
    ],
    details: {
      diameter: "50,724 km",
      orbitalPeriod: "84 Earth years",
      gravity: "8.69 m/s²",
      distanceFromSun: "2.871 billion km",
      surfaceTemp: {
        average: "-195°C",
      },
      moons: 27,
    },
  },
  {
    id: "neptune",
    name: "Neptune",
    description: "The Windy Planet",
    image: "/planets/neptune.jpg",
    color: "from-blue-600 to-indigo-800",
    facts: [
      "Strongest winds in solar system",
      "14 moons discovered",
      "Last planet in our system",
    ],
    details: {
      diameter: "49,244 km",
      orbitalPeriod: "164.79 Earth years",
      gravity: "11.15 m/s²",
      distanceFromSun: "4.495 billion km",
      surfaceTemp: {
        average: "-200°C",
      },
      moons: 14,
    },
  },
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    description: "Earth's Cousin",
    image: "/planets/kepler.jpg",
    color: "from-green-500 to-blue-700",
    facts: [
      "Potentially habitable",
      "First Earth-sized exoplanet",
      "580 light-years away",
    ],
    details: {
      diameter: "13,729 km (estimated)",
      orbitalPeriod: "130 Earth days",
      gravity: "11.25 m/s² (estimated)",
      distanceFromSun: "580 light years",
      surfaceTemp: {
        average: "-85°C to 5°C (estimated)",
      },
      moons: 0,
    },
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    description: "The Promising World",
    image: "/planets/trappist.jpg",
    color: "from-purple-500 to-pink-700",
    facts: [
      "Could have liquid water",
      "Similar size to Earth",
      "39 light-years away",
    ],
    details: {
      diameter: "9,200 km (estimated)",
      orbitalPeriod: "6.1 Earth days",
      gravity: "9.12 m/s² (estimated)",
      distanceFromSun: "39 light years",
      surfaceTemp: {
        average: "-20°C to 15°C (estimated)",
      },
      moons: 0,
    },
  },
];

export default function WeatherPage() {
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | null>(
    null
  );
  const [weatherDisplay, setWeatherDisplay] =
    useState<WeatherDisplayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [
      {
        label: "Solar Wind Speed (km/s)",
        data: [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherData = await getSpaceWeather();
        setSpaceWeather(weatherData);
        // Convert space weather data to display format
        setWeatherDisplay({
          temperature: {
            average: `${weatherData.solarWind.speed} km/s`,
            range: `${weatherData.geomagneticData.kpIndex} Kp`,
          },
          atmosphere: {
            composition: [weatherData.additionalData?.solarFlares || "No data"],
            pressure: weatherData.additionalData?.coronalHoles || "No data",
          },
          phenomena: [weatherData.additionalData?.radiationBelts || "No data"],
          seasons: "Space weather conditions vary continuously",
          facts: [
            `Current solar wind speed: ${weatherData.solarWind.speed} km/s`,
            `Current Kp index: ${weatherData.geomagneticData.kpIndex}`,
          ],
        });
        generateChartData(weatherData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data"
        );
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const generateChartData = (weatherData: SpaceWeatherData) => {
    const now = new Date();
    const timeLabels = Array.from({ length: 6 }, (_, i) => {
      const time = new Date(now.getTime() - (5 - i) * 60000);
      return time.toLocaleTimeString();
    });

    setChartData({
      labels: timeLabels,
      datasets: [
        {
          label: "Solar Wind Speed (km/s)",
          data: Array.from({ length: 6 }, () => weatherData.solarWind.speed),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          tension: 0.4,
        },
      ],
    });
  };

  const togglePlanetComparison = (planetId: string) => {
    if (selectedPlanets.includes(planetId)) {
      setSelectedPlanets((prev) => prev.filter((id) => id !== planetId));
    } else if (selectedPlanets.length < 2) {
      setSelectedPlanets((prev) => [...prev, planetId]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Space Weather Monitor
      </h1>

      {/* Current Space Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Solar Wind</h2>
          <div className="text-4xl font-bold mb-2">
            {spaceWeather?.solarWind.speed.toFixed(1)} km/s
          </div>
          <div className="text-gray-400">
            Last updated:{" "}
            {new Date(
              spaceWeather?.solarWind.timestamp || ""
            ).toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Geomagnetic Activity</h2>
          <div className="text-4xl font-bold mb-2">
            Kp {spaceWeather?.geomagneticData.kpIndex.toFixed(1)}
          </div>
          <div className="text-gray-400">
            Last updated:{" "}
            {new Date(
              spaceWeather?.geomagneticData.timestamp || ""
            ).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Additional Space Weather Data */}
      {spaceWeather?.additionalData && (
        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Current Space Weather Conditions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Solar Flares</h3>
              <p className="text-gray-300">
                {spaceWeather.additionalData.solarFlares}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Coronal Holes</h3>
              <p className="text-gray-300">
                {spaceWeather.additionalData.coronalHoles}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Radiation Belts</h3>
              <p className="text-gray-300">
                {spaceWeather.additionalData.radiationBelts}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Historical Data Chart */}
      <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Solar Wind Speed History
        </h2>
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

      {/* Planet Weather Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Planetary Weather
        </h2>

        {/* Planet Cards Slider */}
        <div className="relative">
          {/* Compare Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setComparisonMode(!comparisonMode);
              setSelectedPlanets([]);
            }}
            className={`absolute -top-12 right-0 px-4 py-2 rounded-lg ${
              comparisonMode
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Compare Planets
          </motion.button>

          <div className="flex space-x-6 overflow-x-auto pb-6 snap-x">
            {planets.map((planet) => (
              <motion.div
                key={planet.id}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="flex-shrink-0 w-80 snap-center cursor-pointer"
                onClick={() => {
                  if (comparisonMode) {
                    togglePlanetComparison(planet.id);
                  } else {
                    setSelectedPlanet(planet.id);
                  }
                }}
              >
                <div
                  className={`p-6 rounded-xl backdrop-blur-sm border relative overflow-hidden ${
                    comparisonMode
                      ? selectedPlanets.includes(planet.id)
                        ? `bg-gradient-to-br ${planet.color} bg-opacity-70 border-blue-500/50`
                        : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-500/20"
                      : selectedPlanet === planet.id
                      ? `bg-gradient-to-br ${planet.color} bg-opacity-70 border-blue-500/50`
                      : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-500/20"
                  }`}
                >
                  {/* Planet Image with Enhanced Effects */}
                  <motion.div
                    className="relative w-full h-48 mb-4 rounded-lg overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center transform transition-transform duration-5000"
                      style={{
                        backgroundImage: `url(${planet.image})`,
                      }}
                    />
                    {/* Atmosphere Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, transparent 30%, ${
                          planet.color.split(" ")[1]
                        } 150%)`,
                      }}
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2">{planet.name}</h3>
                  <p className="text-gray-400 mb-4">{planet.description}</p>

                  {/* Quick Facts with Enhanced Animation */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: selectedPlanet === planet.id ? 1 : 0,
                      height: selectedPlanet === planet.id ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2">
                      {planet.facts.map((fact, index) => (
                        <motion.p
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-sm text-gray-300 flex items-center space-x-2"
                        >
                          <motion.span
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2,
                            }}
                          >
                            •
                          </motion.span>
                          <span>{fact}</span>
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Interactive Elements */}
                  <motion.div
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    whileHover={{
                      scale: 1.2,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanet(
                        selectedPlanet === planet.id ? null : planet.id
                      );
                    }}
                  >
                    <span className="text-xl">ℹ️</span>
                  </motion.div>

                  {/* Detailed Info Popup */}
                  {selectedPlanet === planet.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-sm p-4 rounded-xl z-10"
                    >
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold">Planetary Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Diameter</p>
                            <p className="font-semibold">
                              {planet.details?.diameter}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Orbital Period</p>
                            <p className="font-semibold">
                              {planet.details?.orbitalPeriod}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Gravity</p>
                            <p className="font-semibold">
                              {planet.details?.gravity}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Distance from Sun</p>
                            <p className="font-semibold">
                              {planet.details?.distanceFromSun}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-400">Surface Temperature</p>
                            <p className="font-semibold">
                              {planet.details?.surfaceTemp.average
                                ? planet.details.surfaceTemp.average
                                : `Day: ${planet.details?.surfaceTemp.day}, Night: ${planet.details?.surfaceTemp.night}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Compare Mode Indicator */}
                  {comparisonMode && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPlanets.includes(planet.id)
                            ? "border-blue-500 bg-blue-500/50"
                            : "border-gray-500"
                        }`}
                      >
                        {selectedPlanets.includes(planet.id) && "✓"}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Planet Comparison View */}
        {comparisonMode && selectedPlanets.length === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-500/20"
          >
            <h3 className="text-2xl font-bold mb-6">Planet Comparison</h3>
            <div className="grid grid-cols-3 gap-4">
              <div></div>
              {selectedPlanets.map((planetId) => (
                <div key={planetId} className="text-center">
                  <h4 className="text-xl font-bold mb-2">
                    {planets.find((p) => p.id === planetId)?.name}
                  </h4>
                </div>
              ))}

              {/* Comparison Metrics */}
              {[
                {
                  label: "Diameter",
                  key: "diameter" as keyof PlanetDetails,
                },
                {
                  label: "Orbital Period",
                  key: "orbitalPeriod" as keyof PlanetDetails,
                },
                {
                  label: "Gravity",
                  key: "gravity" as keyof PlanetDetails,
                },
                {
                  label: "Distance from Sun",
                  key: "distanceFromSun" as keyof PlanetDetails,
                },
                { label: "Moons", key: "moons" as keyof PlanetDetails },
                {
                  label: "Temperature",
                  key: "surfaceTemp" as keyof PlanetDetails,
                  format: (temp: PlanetDetails["surfaceTemp"]) =>
                    temp.average || `Day: ${temp.day}, Night: ${temp.night}`,
                },
              ].map((metric) => (
                <React.Fragment key={metric.key}>
                  <div className="font-semibold text-gray-400">
                    {metric.label}
                  </div>
                  {selectedPlanets.map((planetId) => {
                    const planet = planets.find((p) => p.id === planetId);
                    const value = planet?.details?.[metric.key];
                    return (
                      <div
                        key={`${planetId}-${metric.key}`}
                        className="text-center"
                      >
                        {metric.format
                          ? metric.format(value as PlanetDetails["surfaceTemp"])
                          : String(value)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selected Planet Weather Details */}
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {error ? (
              <div className="p-6 rounded-xl bg-red-900/20 border border-red-500/20">
                <p className="text-lg text-red-300">{error}</p>
              </div>
            ) : weatherDisplay ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Temperature Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20"
                >
                  <h3 className="text-2xl font-bold mb-4">Temperature</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Average</p>
                      <p className="text-2xl font-bold">
                        {weatherDisplay.temperature?.average || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Range</p>
                      <p className="text-xl">
                        {weatherDisplay.temperature?.range || "N/A"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Atmosphere Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20"
                >
                  <h3 className="text-2xl font-bold mb-4">Atmosphere</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Composition</p>
                      <ul className="list-disc list-inside">
                        {weatherDisplay.atmosphere?.composition.map(
                          (gas: string, index: number) => (
                            <li key={index} className="text-lg">
                              {gas}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="text-gray-400">Pressure</p>
                      <p className="text-xl">
                        {weatherDisplay.atmosphere?.pressure || "N/A"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Phenomena Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20"
                >
                  <h3 className="text-2xl font-bold mb-4">Notable Phenomena</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {weatherDisplay.phenomena?.map(
                      (phenomenon: string, index: number) => (
                        <li key={index} className="text-lg">
                          {phenomenon}
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>

                {/* Seasons Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20"
                >
                  <h3 className="text-2xl font-bold mb-4">Seasonal Changes</h3>
                  <p className="text-lg">
                    {weatherDisplay.seasons || "Seasonal data unavailable"}
                  </p>
                </motion.div>

                {/* Facts Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/20 md:col-span-2"
                >
                  <h3 className="text-2xl font-bold mb-4">Interesting Facts</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {weatherDisplay.facts?.map(
                      (fact: string, index: number) => (
                        <li key={index} className="text-lg">
                          {fact}
                        </li>
                      )
                    )}
                  </ul>
                </motion.div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-red-900/20 border border-red-500/20">
                <p className="text-lg text-red-300">
                  Failed to load weather data for {selectedPlanet}. Please try
                  again later.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
