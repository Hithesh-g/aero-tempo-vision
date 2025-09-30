import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { Station } from '@/lib/mockData';
import { AQIBadge } from './AQIBadge';
import { getAQILevel } from '@/lib/aqi';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  stations: Station[];
  onStationSelect?: (station: Station) => void;
  selectedStationId?: string;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ stations, onStationSelect, selectedStationId }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // US center
  const [mapZoom, setMapZoom] = useState(4);
  
  const selectedStation = stations.find(s => s.id === selectedStationId);
  
  useEffect(() => {
    if (selectedStation) {
      setMapCenter([selectedStation.lat, selectedStation.lon]);
      setMapZoom(12);
    }
  }, [selectedStation]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-2xl border border-border"
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        style={{ background: 'hsl(var(--card))' }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {stations.map((station) => {
          const level = getAQILevel(station.currentAQI);
          
          // Create custom colored markers based on AQI
          const colorMap: Record<string, string> = {
            good: '#22c55e',
            moderate: '#eab308',
            'unhealthy-sensitive': '#f97316',
            unhealthy: '#ef4444',
            'very-unhealthy': '#dc2626',
            hazardous: '#991b1b',
          };
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                width: 32px;
                height: 32px;
                background: ${colorMap[level.level]};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 11px;
                color: white;
              ">
                ${station.currentAQI}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lon]}
              icon={customIcon}
              eventHandlers={{
                click: () => onStationSelect?.(station),
              }}
            >
              <Popup>
                <div className="p-2 space-y-2">
                  <h3 className="font-semibold text-sm">{station.name}</h3>
                  <AQIBadge aqi={station.currentAQI} size="sm" animate={false} />
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div>
                      <p className="text-muted-foreground">NO₂</p>
                      <p className="font-semibold">{station.pollutants.no2}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">O₃</p>
                      <p className="font-semibold">{station.pollutants.o3}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">PM2.5</p>
                      <p className="font-semibold">{station.pollutants.pm25}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-semibold mb-2">Air Quality Index</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-aqi-good" />
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-aqi-moderate" />
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-aqi-unhealthy" />
            <span>Unhealthy (101+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
