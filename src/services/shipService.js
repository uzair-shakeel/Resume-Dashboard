import { shipDataService } from "./shipDataService";
import { MOCK_SHIPS } from "./mockData";

// Development flag - set to true to use mock data
const DEV_MODE = process.env.NODE_ENV === "development";

export const shipService = {
  getAllShips: async (useMockData = true) => {
    try {
      if (useMockData) {
        console.log("Using mock ship data");
        return MOCK_SHIPS;
      }

      // In the real implementation, we would fetch all ships
      // Define the IMO numbers we want to fetch
      const imoNumbers = [
        "9996903", // Amadeus Saffier
        "9512331", // NBA Magritte
        "999690", // Amadeus
      ];

      // Use the specific timestamps instead of calculating from current time
      const startTime = 1741281633; // Specific start timestamp
      const endTime = 1741317363; // Specific end timestamp

      console.log(
        `Fetching live ship data from ${new Date(
          startTime * 1000
        ).toLocaleString()} to ${new Date(endTime * 1000).toLocaleString()}`
      );

      // Fetch data for all ships
      const shipPromises = imoNumbers.map((imo) =>
        shipDataService
          .getShipStatistics(imo, startTime, endTime, false) // Use specific timestamps
          .then((response) => {
            if (!response) {
              console.warn(`Invalid response format from API for IMO: ${imo}`);
              return null;
            }

            // Log the API response for debugging
            console.log(`Received data for ship with IMO ${imo}:`, {
              name: response.name,
              dataPoints: response.results_meta?.data_points_collected || 0,
              timePoints: response.results_timed?.length || 0,
            });

            return shipDataService.transformShipData(response);
          })
          .catch((error) => {
            // Instead of propagating the error, log it and return null
            // This allows other ships to still be processed
            console.error(`Failed to fetch ship with IMO ${imo}:`, error);
            return null;
          })
      );

      try {
        // Use Promise.allSettled instead of Promise.all to handle individual failures
        const results = await Promise.allSettled(shipPromises);

        // Extract successful results
        const ships = results
          .filter(
            (result) => result.status === "fulfilled" && result.value !== null
          )
          .map((result) => result.value);

        // Filter out any null responses
        const validShips = ships.filter((ship) => ship !== null);

        // Create a map of IMO numbers that have data
        const shipsWithDataByImo = {};
        validShips.forEach((ship) => {
          shipsWithDataByImo[ship.imo] = true;
        });

        // Create placeholder ships for IMO numbers that don't have data
        const placeholderShips = imoNumbers
          .filter((imo) => !shipsWithDataByImo[imo])
          .map((imo, index) => {
            // Get the correct name based on IMO number
            let shipName;
            if (imo === "9996903") {
              shipName = "Amadeus Saffier";
            } else if (imo === "9512331") {
              shipName = "NBA Magritte";
            } else if (imo === "999690") {
              shipName = "Amadeus";
            } else {
              shipName = `Ship ${imo}`;
            }

            return {
              id: 10000 + index, // Ensure unique ID that won't conflict with real ships
              name: shipName,
              imo: imo,
              position: { latitude: 52.3708, longitude: 4.8958 },
              path: [],
              timeSeriesData: [],
              statistics: {
                wind_speed: { avg: 0, min: 0, max: 0 },
                fan_speed: { avg: 0, min: 0, max: 0 },
              },
              status: "Unknown",
              type: "Unknown",
              destination: "Unknown",
              eta: "Unknown",
              color: "#6366f1",
              hasData: false,
            };
          });

        // Combine valid ships with placeholder ships
        const allShips = [...validShips, ...placeholderShips];

        // Ensure each ship has a unique ID
        const uniqueShips = allShips.map((ship, index) => ({
          ...ship,
          id: ship.id || index + 1, // Use existing ID or create a new one based on index
          hasData: ship.hasData !== undefined ? ship.hasData : true, // Mark ships with data
        }));

        console.log(
          `Successfully fetched ${uniqueShips.length} ships (${validShips.length} with data, ${placeholderShips.length} placeholders)`
        );
        return uniqueShips;
      } catch (error) {
        // In live mode, we propagate the error instead of falling back to mock data
        console.error("Failed to fetch ships:", error);
        throw new Error(`Failed to fetch live data: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to fetch ships:", error);
      // In live mode, we propagate the error instead of falling back to mock data
      throw error;
    }
  },

  updateShipData: async (shipData, useMockData = DEV_MODE) => {
    try {
      if (useMockData) {
        console.log("Using mock data for update");
        return { success: true, data: shipData };
      }

      return await shipDataService.submitShipData(shipData);
    } catch (error) {
      console.error("Failed to update ship data:", error);
      throw error;
    }
  },

  getShipStatistics: async (
    imo,
    startTime,
    endTime,
    useMockData = DEV_MODE
  ) => {
    try {
      if (useMockData) {
        console.log("Using mock statistics data");
        const mockShip = MOCK_SHIPS.find((ship) => ship.imo === imo);
        return mockShip || null;
      }

      // Convert dates to timestamps if they're not already
      const startTimestamp =
        typeof startTime === "number"
          ? startTime
          : Math.floor(new Date(startTime).getTime() / 1000);

      const endTimestamp =
        typeof endTime === "number"
          ? endTime
          : Math.floor(new Date(endTime).getTime() / 1000);

      // For live mode, use the provided timestamps
      const response = await shipDataService.getShipStatistics(
        imo,
        startTimestamp,
        endTimestamp,
        false // Explicitly set useMockData to false
      );

      return shipDataService.transformShipData(response);
    } catch (error) {
      console.error("Failed to fetch ship statistics:", error);

      // In live mode, don't fall back to mock data, instead throw the error
      if (!useMockData) {
        throw new Error(
          `Failed to fetch live data for ship with IMO ${imo}: ${error.message}`
        );
      }

      // Only in mock mode, fall back to mock data
      const mockShip = MOCK_SHIPS.find((ship) => ship.imo === imo);
      return mockShip || null;
    }
  },
};
