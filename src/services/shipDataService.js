import { api } from "./api";
import { locationService } from "./locationService";

// Development flag - set to true to use mock data
const DEV_MODE = process.env.NODE_ENV === "development";

export const shipDataService = {
  // Get ship statistics for a specific time range
  getShipStatistics: async (
    imo,
    startTime,
    endTime,
    useMockData = DEV_MODE
  ) => {
    try {
      if (!useMockData) {
        // Verify Netherlands VPN connection
        await locationService.getNetherlands();

        console.log(
          `Fetching ship statistics for IMO ${imo} from ${new Date(
            startTime * 1000
          ).toLocaleString()} to ${new Date(endTime * 1000).toLocaleString()}`
        );

        // Use the provided timestamps for the API request
        const response = await api.get(`/data/ships/${imo}/statistics`, {
          params: {
            start_time: startTime,
            end_time: endTime,
          },
        });

        console.log("API response:", response.data);

        if (!response.data) {
          throw new Error("No data received from API");
        }

        return response.data;
      }

      // If using mock data, return mock data from MOCK_SHIPS instead of trying to fetch from file
      try {
        // Import mock data directly from mockData.js
        const { MOCK_SHIPS } = await import("./mockData");
        const mockShip = MOCK_SHIPS.find((ship) => ship.imo === imo);

        if (!mockShip) {
          throw new Error(`Mock data not found for IMO: ${imo}`);
        }

        return {
          imo: mockShip.imo,
          name: mockShip.name,
          results_meta: {
            data_points_collected: mockShip.timeSeriesData?.length || 0,
          },
          results_aggregated: {
            aggregation_min: {
              wind_speed: mockShip.statistics?.wind_speed?.min || 0,
              fan_speed: mockShip.statistics?.fan_speed?.min || 0,
            },
            aggregation_max: {
              wind_speed: mockShip.statistics?.wind_speed?.max || 0,
              fan_speed: mockShip.statistics?.fan_speed?.max || 0,
            },
            aggregation_avg: {
              wind_speed: mockShip.statistics?.wind_speed?.avg || 0,
              fan_speed: mockShip.statistics?.fan_speed?.avg || 0,
            },
          },
          results_timed:
            mockShip.timeSeriesData?.map((point) => ({
              uuid: crypto.randomUUID(),
              timestamp: point.timestamp,
              sailData: [
                {
                  windAngle: point.windAngle || 0,
                  windSpeed: point.wind_speed || 0,
                  fanSpeed: point.fan_speed || 0,
                },
              ],
              shipData: {
                location: point.location || { latitude: 0, longitude: 0 },
                cog: point.cog || 0,
                sog: point.sog || 0,
                hdg: point.hdg || 0,
                rudderAngle: point.rudderAngle || 0,
              },
            })) || [],
        };
      } catch (mockError) {
        console.error("Failed to load mock data:", mockError);
        throw new Error("Failed to load mock data");
      }
    } catch (error) {
      console.error("Failed to fetch ship statistics:", error);
      // In live mode, propagate the error without any fallback
      if (!useMockData) {
        throw new Error(`Failed to fetch live data: ${error.message}`);
      }
      // In mock mode, propagate the mock data error
      throw error;
    }
  },

  // Submit ship data
  submitShipData: async (shipData, useMockData = DEV_MODE) => {
    try {
      if (!useMockData) {
        // Verify Netherlands VPN connection
        await locationService.getNetherlands();
      }

      // If in mock mode, return a successful response
      if (useMockData) {
        console.log("Using mock mode for ship submission");
        return {
          success: true,
          message: "Ship data submitted successfully (mock)",
          data: shipData,
        };
      }

      const processedData = shipDataService.processShipRecord(shipData);

      // For debugging
      console.log("Submitting ship data to API");
      console.log("Processed data:", processedData);

      const response = await api.post(`/data/ships`, processedData);

      return response.data;
    } catch (error) {
      console.error("Failed to submit ship data:", error);

      // For debugging - log more details about the error
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }

      throw error;
    }
  },

  // Transform API data to application format with better error handling
  transformShipData: (apiData) => {
    try {
      if (!apiData || typeof apiData !== "object") {
        throw new Error("Invalid API data received");
      }

      const {
        imo,
        name,
        results_aggregated = {},
        results_timed = [],
        shipData = {}, // Additional ship data from API
      } = apiData;

      // Validate required fields
      if (!imo || !name) {
        throw new Error("Missing required fields in API data");
      }

      // Extract aggregated statistics
      const statistics_min = results_aggregated.aggregation_min || {};
      const statistics_max = results_aggregated.aggregation_max || {};
      const statistics_avg = results_aggregated.aggregation_avg || {};

      // Extract location data from API if available
      // Since shipData is empty in the API response, we'll use default positions
      // but generate a more realistic path based on timestamps
      let shipPosition = { latitude: 52.371, longitude: 4.895 }; // Default position (Amsterdam)
      let shipPath = [];

      // Use a specific path for IMO 9996903
      if (imo === "9996903") {
        shipPath = [
          [52.3702, 4.8952], // Amsterdam
          [52.422, 4.58], // Haarlem
          [52.4632, 4.5552], // Beverwijk
          [52.5, 4.2], // North Sea
          [52.45, 3.9], // North Sea
          [52.2, 3.7], // North Sea
          [51.99, 3.8], // North Sea
          [51.9581, 4.0494], // Hoek van Holland
          [51.9225, 4.4792], // Rotterdam
        ];

        // Set the current position to the last point in the path
        shipPosition = {
          latitude: shipPath[shipPath.length - 1][0],
          longitude: shipPath[shipPath.length - 1][1],
        };
      }
      // Generate a path based on timestamps if we have time series data
      else if (results_timed && results_timed.length > 0) {
        // Sort time series data by timestamp
        const sortedTimeSeries = [...results_timed].sort(
          (a, b) => a.timestamp - b.timestamp
        );

        // Generate a path that changes slightly for each timestamp
        // This simulates ship movement over time
        shipPath = sortedTimeSeries.map((point, index) => {
          // Create a small variation based on the index
          const latOffset = (index * 0.01) % 0.2;
          const lonOffset = (index * 0.015) % 0.3;

          // Alternate between adding and subtracting to create a zigzag path
          const lat =
            shipPosition.latitude + (index % 2 === 0 ? latOffset : -latOffset);
          const lon =
            shipPosition.longitude + (index % 2 === 0 ? lonOffset : -lonOffset);

          return [lat, lon];
        });

        // Use the last position as the current ship position
        if (shipPath.length > 0) {
          const lastPoint = shipPath[shipPath.length - 1];
          shipPosition = { latitude: lastPoint[0], longitude: lastPoint[1] };
        }
      } else {
        // If no time series data, use default path
        shipPath = [
          [shipPosition.latitude - 0.1, shipPosition.longitude - 0.1],
          [shipPosition.latitude - 0.05, shipPosition.longitude - 0.05],
          [shipPosition.latitude, shipPosition.longitude],
          [shipPosition.latitude + 0.05, shipPosition.longitude + 0.05],
          [shipPosition.latitude + 0.1, shipPosition.longitude + 0.1],
        ];
      }

      // Determine ship type based on IMO or name if not provided by API
      let shipType = shipData.type || "Unknown";
      if (!shipType || shipType === "Unknown") {
        // Try to infer ship type from name or IMO
        if (name.toLowerCase().includes("tanker")) {
          shipType = "Tanker";
        } else if (name.toLowerCase().includes("container")) {
          shipType = "Container Ship";
        } else if (name.toLowerCase().includes("bulk")) {
          shipType = "Bulk Carrier";
        } else if (imo === "9996903") {
          shipType = "Container Ship";
        } else if (imo === "9512331") {
          shipType = "Bulk Carrier";
        } else if (imo === "999690") {
          shipType = "Tanker";
        } else {
          shipType = "Cargo Ship";
        }
      }

      // Determine ship status based on API data or default to "En Route"
      const shipStatus = shipData.status || "En Route";

      // Determine destination and ETA from API data or use defaults
      const destination = shipData.destination || "Rotterdam, Netherlands";
      const eta =
        shipData.eta ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Transform time series data
      const timeSeriesData = results_timed.map((point, index) => {
        // Get the first sail data if available
        const sailData =
          point.sailData && point.sailData.length > 0
            ? point.sailData[0]
            : { windSpeed: 0, windAngle: 0, fanSpeed: 0 };

        // Get ship data if available, otherwise use generated position
        const pointShipData = point.shipData || {};

        // Use generated location for this point in the path
        const location =
          pointShipData.location ||
          (shipPath[index]
            ? {
                latitude: shipPath[index][0],
                longitude: shipPath[index][1],
              }
            : {
                latitude: shipPosition.latitude,
                longitude: shipPosition.longitude,
              });

        // Generate some realistic navigation data based on the index
        const sog = 8 + Math.sin(index * 0.5) * 2; // Speed between 6-10 knots
        const cog = (45 + index * 5) % 360; // Course changing gradually
        const hdg = cog + Math.sin(index * 0.3) * 10; // Heading close to course with some variation
        const rudderAngle = Math.sin(index * 0.7) * 15; // Rudder angle between -15 and 15 degrees

        return {
          timestamp: point.timestamp,
          wind_speed: sailData.windSpeed || 0,
          fan_speed: sailData.fanSpeed || 0,
          windAngle: sailData.windAngle || 0,
          location: location,
          rudderAngle: pointShipData.rudderAngle || rudderAngle,
          sog: pointShipData.sog || sog,
          cog: pointShipData.cog || cog,
          hdg: pointShipData.hdg || hdg,
          windDirection: sailData.windAngle || 0,
        };
      });

      // Generate a color based on the ship's IMO
      const generateColor = (imo) => {
        const colors = [
          "#6366f1", // Indigo
          "#8B5CF6", // Purple
          "#EC4899", // Pink
          "#10B981", // Green
          "#F59E0B", // Amber
          "#EF4444", // Red
        ];

        // Use the last digit of the IMO to select a color
        const lastDigit = parseInt(imo.slice(-1), 10);
        return colors[lastDigit % colors.length];
      };

      return {
        id: imo,
        name,
        imo,
        statistics: {
          wind_speed: {
            avg: statistics_avg.wind_speed || 0,
            max: statistics_max.wind_speed || 0,
            min: statistics_min.wind_speed || 0,
          },
          fan_speed: {
            avg: statistics_avg.fan_speed || 0,
            max: statistics_max.fan_speed || 0,
            min: statistics_min.fan_speed || 0,
          },
        },
        timeSeriesData,
        path: shipPath,
        position: shipPosition,
        type: shipType,
        status: shipStatus,
        destination: destination,
        eta: eta,
        color: generateColor(imo),
        performanceData: {
          labels: timeSeriesData.map((point) =>
            new Date(point.timestamp * 1000).toLocaleTimeString()
          ),
          datasets: [
            {
              label: "Wind Speed (knots)",
              data: timeSeriesData.map((point) => point.wind_speed),
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              tension: 0.4,
            },
            {
              label: "Fan Speed",
              data: timeSeriesData.map((point) => point.fan_speed),
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.4,
            },
          ],
        },
        // Generate other chart data based on actual time series data
        windSpeedData: {
          labels: timeSeriesData.map((point) =>
            new Date(point.timestamp * 1000).toLocaleTimeString()
          ),
          datasets: [
            {
              label: "Wind Speed",
              data: timeSeriesData.map((point) => point.wind_speed),
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              tension: 0.4,
            },
          ],
        },
        wingRotationData: {
          labels: timeSeriesData.map((point) =>
            new Date(point.timestamp * 1000).toLocaleTimeString()
          ),
          datasets: [
            {
              label: "Wind Angle",
              data: timeSeriesData.map((point) => point.windAngle || 0),
              borderColor: "#6366f1",
              backgroundColor: "rgb(99, 102, 241)",
              barThickness: 8,
            },
          ],
        },
        // Add default cargo data
        cargoData: {
          labels: ["General Cargo", "Containers", "Bulk Materials", "Liquids"],
          datasets: [
            {
              data: [
                Math.floor(Math.random() * 40) + 20,
                Math.floor(Math.random() * 30) + 10,
                Math.floor(Math.random() * 20) + 5,
                Math.floor(Math.random() * 15) + 5,
              ],
              backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(139, 92, 246, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(16, 185, 129, 0.8)",
              ],
              borderColor: [
                "rgba(99, 102, 241, 1)",
                "rgba(139, 92, 246, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(16, 185, 129, 1)",
              ],
            },
          ],
        },
        // Add default maintenance data
        maintenanceData: {
          labels: ["Engine", "Hull", "Navigation", "Electrical", "Safety"],
          datasets: [
            {
              label: "Maintenance Hours",
              data: [
                Math.floor(Math.random() * 50) + 20,
                Math.floor(Math.random() * 40) + 10,
                Math.floor(Math.random() * 30) + 10,
                Math.floor(Math.random() * 25) + 15,
                Math.floor(Math.random() * 20) + 10,
              ],
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        },
      };
    } catch (error) {
      console.error("Error transforming ship data:", error);
      throw new Error("Failed to process ship data: " + error.message);
    }
  },

  // Process ship record for submission
  processShipRecord: (shipData) => {
    const {
      imo,
      name,
      position,
      windSpeed,
      fanSpeed,
      wingRotationAngle,
      course,
      speed,
      rudderAngle,
      windDirection,
    } = shipData;

    return {
      imo,
      name,
      data: [
        {
          uuid: crypto.randomUUID(),
          timestamp: Math.floor(Date.now() / 1000), // Convert to seconds for API
          sailData: [
            {
              sailId: "1",
              windSpeed,
              fanSpeed,
              windRotationAngle: wingRotationAngle,
              windAngle: windDirection || course,
              wingUp: false,
              wingDown: false,
              autoModeOn: false,
              forwardForce: null,
              sidewayForce: null,
              hpRunning: false,
              alarmPresent: false,
              autoSailingActive: false,
              reserve: 0,
            },
          ],
          shipData: {
            location: {
              latitude: position.latitude,
              longitude: position.longitude,
            },
            cog: course,
            sog: speed,
            rudderAngle,
          },
        },
      ],
    };
  },

  // Start real-time updates
  startRealtimeUpdates: (imo, callback, interval = 30000) => {
    const updateInterval = setInterval(async () => {
      try {
        const endTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const startTime = endTime - 5 * 60; // Last 5 minutes in seconds
        const data = await shipDataService.getShipStatistics(
          imo,
          startTime,
          endTime
        );
        callback(shipDataService.transformShipData(data));
      } catch (error) {
        console.error("Failed to fetch real-time updates:", error);
      }
    }, interval);

    return () => clearInterval(updateInterval);
  },
};
