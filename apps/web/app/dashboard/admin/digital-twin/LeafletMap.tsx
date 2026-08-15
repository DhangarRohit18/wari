'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Marker {
  lat: number;
  lon: number;
  color: string;
  icon: string;
  label: string;
  data: any;
  layer: string;
}

interface LeafletMapProps {
  markers: Marker[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (data: any) => void;
  selectedItem?: any;
}

export default function LeafletMap({ markers, center, zoom, onMarkerClick, selectedItem }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const routeRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstance.current) {
      // Dynamic require to ensure it's client-side only
      const L = require('leaflet');

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // OpenStreetMap tile layer — works offline-capable, no API key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
    }

    return () => {};
  }, []);

  // Update route polyline when selectedItem changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const L = require('leaflet');

    // Remove existing route if any
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    // If a user is selected, draw a dummy route to Pandharpur center
    if (selectedItem && (selectedItem.layer === 'users' || selectedItem.drawRoute)) {
      const startLat = selectedItem.drawRoute ? 17.6741 : selectedItem.latitude;
      const startLon = selectedItem.drawRoute ? 75.3279 : selectedItem.longitude;
      
      const endLat = selectedItem.drawRoute ? selectedItem.latitude : 17.6741;
      const endLon = selectedItem.drawRoute ? selectedItem.longitude : 75.3279;
      
      const latlngs = [
        [startLat, startLon],
        [endLat, endLon]
      ];

      routeRef.current = L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(mapInstance.current);
    }
  }, [selectedItem]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const L = require('leaflet');

    // Clear old markers
    markerRefs.current.forEach(m => m.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach(({ lat, lon, color, icon, label, data }) => {
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) return;

      // Create custom div icon
      const iconEl = L.divIcon({
        html: `<div style="
          width: 34px; height: 34px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s;
        ">${icon}</div>`,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([lat, lon], { icon: iconEl })
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 160px;">
            <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">${icon} ${label}</div>
            ${data.status ? `<div style="font-size:0.75rem;color:#6B7280;">Status: <strong>${data.status}</strong></div>` : ''}
            ${data.crowd_level ? `<div style="font-size:0.75rem;color:#6B7280;">Density: ${((data.current_density || 0) * 100).toFixed(0)}%</div>` : ''}
            ${data.current_count !== undefined ? `<div style="font-size:0.75rem;color:#6B7280;">Served: ${data.current_count}/${data.capacity}</div>` : ''}
            ${data.category ? `<div style="font-size:0.75rem;color:#EF4444;font-weight:600;">🆘 ${data.category}</div>` : ''}
          </div>
        `, { maxWidth: 220 })
        .addTo(mapInstance.current);

      marker.on('click', () => {
        onMarkerClick({ ...data, _icon: icon, _label: label, _color: color });
      });

      markerRefs.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: 400, borderRadius: 16 }}
    />
  );
}
