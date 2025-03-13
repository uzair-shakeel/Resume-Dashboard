import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { MapPin } from "lucide-react";
import TimeControl from "./TimeControl";

// Map Controller Component to handle map updates
const MapController = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map) map.setView(center, 5);
  }, [center, map]);

  return null;
};

// Create custom ship icon
const createShipIcon = () => {
  const shipSvg = renderToString(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      width={34}
      height={34}
    >
      <path d="M9 4H14.4458C14.7905 4 15.111 4.17762 15.2938 4.47L18.75 10H23.1577C23.4339 10 23.6577 10.2239 23.6577 10.5C23.6577 10.5837 23.6367 10.666 23.5967 10.7394L19.6599 17.9568C19.444 17.9853 19.2237 18 19 18C17.3644 18 15.9122 17.2147 15 16.0005C14.0878 17.2147 12.6356 18 11 18C9.3644 18 7.91223 17.2147 7 16.0005C6.08777 17.2147 4.6356 18 3 18C2.81381 18 2.63 17.9898 2.44909 17.97L1.21434 11.1789C1.11555 10.6355 1.47595 10.1149 2.01933 10.0161C2.07835 10.0054 2.13822 10 2.19821 10H3V5C3 4.44772 3.44772 4 4 4H5V1H9V4ZM5 10H16.3915L13.8915 6H5V10ZM3 20C4.53671 20 5.93849 19.4223 7 18.4722C8.06151 19.4223 9.46329 20 11 20C12.5367 20 13.9385 19.4223 15 18.4722C16.0615 19.4223 17.4633 20 19 20H21V22H19C17.5429 22 16.1767 21.6104 15 20.9297C13.8233 21.6104 12.4571 22 11 22C9.54285 22 8.17669 21.6104 7 20.9297C5.82331 21.6104 4.45715 22 3 22H1V20H3Z"></path>
    </svg>
  );
  return L.divIcon({
    html: shipSvg,
    className: "custom-ship-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Create custom pin icon
const createPinIcon = () => {
  const pinSvg = renderToString(
    <MapPin style={{ color: "black", fill: "white" }} />
  );
  return L.divIcon({
    html: pinSvg,
    className: "custom-pin-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const ShipMap = ({ ship, currentTimeIndex, onTimeChange }) => {
  const mapRef = React.useRef(null);

  // Add custom icon styles
  const iconStyle = `
    .custom-ship-icon, .custom-pin-icon {
      background: none;
      border: none;
    }
    .custom-ship-icon svg, .custom-pin-icon svg {
      width: 24px;
      height: 24px;
    }
  `;

  // Check if ship has data
  const hasData = ship.timeSeriesData && ship.timeSeriesData.length > 0;
  const hasPath = ship.path && ship.path.length > 0;

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Ship Location & Route</h2>

      {!hasData && (
        <div className="bg-yellow-800 bg-opacity-50 text-yellow-200 p-4 rounded-md mb-4">
          <p className="font-semibold">No data available for this ship</p>
          <p className="text-sm mt-1">
            This ship doesn't have any time series data. The map will show the
            ship's position, but no route or time-based information is
            available.
          </p>
        </div>
      )}

      <div className="h-[400px] rounded-lg overflow-hidden">
        <style>{iconStyle}</style>
        <MapContainer
          center={[ship.position.latitude, ship.position.longitude]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          minZoom={2}
          ref={mapRef}
        >
          <MapController
            center={[ship.position.latitude, ship.position.longitude]}
          />
          {/* Land layer */}
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            zIndex={1}
          />
          {/* OpenSeaMap layer */}
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            zIndex={2}
          />

          {/* Current Position with Ship Icon */}
          <Marker
            position={[ship.position.latitude, ship.position.longitude]}
            icon={createShipIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-gray-900">
                <h3 className="font-bold">{ship.name}</h3>
                <p>IMO: {ship.imo}</p>
                <p>Status: {ship.status}</p>
                <p>
                  Position: {ship.position.latitude.toFixed(4)}°N,{" "}
                  {ship.position.longitude.toFixed(4)}°E
                </p>
                <p>
                  Wind Speed: {ship.statistics?.wind_speed?.avg || "N/A"} knots
                </p>
                <p className="text-xs text-gray-600">
                  (min: {ship.statistics?.wind_speed?.min || "N/A"}, max:{" "}
                  {ship.statistics?.wind_speed?.max || "N/A"})
                </p>
                <p>Fan Speed: {ship.statistics?.fan_speed?.avg || "N/A"}</p>
                <p className="text-xs text-gray-600">
                  (min: {ship.statistics?.fan_speed?.min || "N/A"}, max:{" "}
                  {ship.statistics?.fan_speed?.max || "N/A"})
                </p>
                <p>Destination: {ship.destination}</p>
                <p>ETA: {ship.eta}</p>
                {!hasData && (
                  <p className="text-yellow-600 font-semibold mt-2">
                    No time series data available
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Route Points with Time Data */}
          {hasPath &&
            ship.path.map(
              (point, index) =>
                point &&
                point.length === 2 && (
                  <Marker
                    key={`point-${index}`}
                    position={point}
                    icon={createPinIcon()}
                    zIndexOffset={500}
                    opacity={index === currentTimeIndex ? 1 : 0.5}
                  >
                    <Popup>
                      <div className="text-gray-900">
                        <h3 className="font-bold">Route Point {index + 1}</h3>
                        <p>{ship.name}</p>
                        <p>
                          Position: {point[0].toFixed(4)}°N,{" "}
                          {point[1].toFixed(4)}
                          °E
                        </p>
                        {ship.timeSeriesData?.[index] && (
                          <>
                            <p>
                              Time:{" "}
                              {new Date(
                                ship.timeSeriesData[index].timestamp
                              ).toLocaleString()}
                            </p>
                            <p>
                              Wind Speed:{" "}
                              {ship.timeSeriesData[index].wind_speed} knots
                            </p>
                            <p>
                              Fan Speed: {ship.timeSeriesData[index].fan_speed}
                            </p>
                            <p>
                              Wind Direction:{" "}
                              {ship.timeSeriesData[index].windDirection}°
                            </p>
                            <p>
                              Speed Over Ground:{" "}
                              {ship.timeSeriesData[index].sog} knots
                            </p>
                            <p>
                              Course Over Ground:{" "}
                              {ship.timeSeriesData[index].cog}°
                            </p>
                            <p>Heading: {ship.timeSeriesData[index].hdg}°</p>
                            <p>
                              Rudder Angle:{" "}
                              {ship.timeSeriesData[index].rudderAngle}°
                            </p>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
            )}

          {/* Path Line */}
          {hasPath && ship.path.length > 1 && (
            <Polyline
              positions={ship.path}
              color={ship.color}
              weight={3}
              opacity={0.9}
              dashArray="2, 8, 12, 8"
            />
          )}

          <TimeControl
            ship={ship}
            currentTimeIndex={currentTimeIndex}
            onTimeChange={onTimeChange}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default ShipMap;
