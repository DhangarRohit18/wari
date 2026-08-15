'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/app/dashboard/admin/digital-twin/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
        <div style={{ color: '#6B7280' }}>Loading Pilgrimage Map...</div>
      </div>
    </div>
  )
});

const LAT = 17.6741, LON = 75.3279;

export default function VarkariMapPage() {
  const [food, setFood] = useState<any[]>([]);
  const [water, setWater] = useState<any[]>([]);
  const [medical, setMedical] = useState<any[]>([]);
  const [toilets, setToilets] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [wellness, setWellness] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, w, m, t, s, wc] = await Promise.all([
          apiCall(`/food/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
          apiCall(`/water/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
          apiCall(`/medical/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
          apiCall(`/toilets/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
          apiCall(`/shelters/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
          apiCall(`/wellness/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).catch(() => []),
        ]);
        setFood(f); setWater(w); setMedical(m); setToilets(t); setShelters(s); setWellness(wc);
      } catch (e) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const markers: any[] = [
    { lat: LAT, lon: LON, color: '#D97706', icon: '🚩', label: 'You (Pandharpur)', data: { name: 'Your Location', status: 'Active' }, layer: 'user' },
    { lat: LAT + 0.025, lon: LON + 0.015, color: '#D97706', icon: '🍛', label: 'Shri Vitthal Annadan Trust', data: { name: 'Shri Vitthal Annadan Trust', available_now: true }, layer: 'food' },
    { lat: LAT - 0.020, lon: LON + 0.030, color: '#2563EB', icon: '💧', label: 'Wakhari Water Station', data: { name: 'Wakhari Water Station', available_now: true }, layer: 'water' },
    { lat: LAT + 0.035, lon: LON - 0.025, color: '#DC2626', icon: '🏥', label: 'Pandharpur District Hospital', data: { name: 'Pandharpur District Hospital', available_now: true, capacity: 50 }, layer: 'medical' },
    { lat: LAT - 0.030, lon: LON - 0.015, color: '#0891B2', icon: '🚻', label: 'Public Sanitation Block A', data: { name: 'Public Sanitation Block A', available_now: true }, layer: 'toilets' },
    { lat: LAT + 0.040, lon: LON + 0.005, color: '#7C3AED', icon: '🏠', label: 'Bhakta Niwas Shelter', data: { name: 'Bhakta Niwas Shelter', available_now: true, capacity: 200 }, layer: 'shelters' },
    { lat: LAT + 0.015, lon: LON - 0.035, color: '#16A34A', icon: '🌿', label: 'Varkari Wellness Camp', data: { name: 'Varkari Wellness Camp', available_now: true }, layer: 'wellness' }
  ];

  food.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#D97706', icon: '🍛', label: item.name, data: item, layer: 'food' }));
  water.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#2563EB', icon: '💧', label: item.name, data: item, layer: 'water' }));
  medical.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#DC2626', icon: '🏥', label: item.name, data: item, layer: 'medical' }));
  toilets.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#0891B2', icon: '🚻', label: item.name, data: item, layer: 'toilets' }));
  shelters.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#7C3AED', icon: '🏠', label: item.name, data: item, layer: 'shelters' }));
  wellness.forEach(item => markers.push({ lat: item.latitude, lon: item.longitude, color: '#16A34A', icon: '🌿', label: item.name, data: item, layer: 'wellness' }));

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🗺️ Pilgrimage Map</h1>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Live services & facilities across Wari route</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
            {[['🍛','Annadan'],['💧','Water'],['🏥','Medical'],['🚻','Sanitation'],['🏠','Shelter'],['🌿','Wellness']].map(([i,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>{i}</span>{l}</div>
            ))}
          </div>
        </header>

        <div style={{ position: 'relative', flex: 1, height: 'calc(100vh - 80px)' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="spinner" style={{ width: 48, height: 48 }} />
            </div>
          )}

          <LeafletMap
            markers={markers}
            center={[LAT, LON]}
            zoom={13}
            onMarkerClick={(data: any) => setSelectedItem(data)}
            selectedItem={selectedItem}
          />

          {/* Bottom Card for Selected Item */}
          {selectedItem && (
            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'white', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000, maxWidth: 500, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{selectedItem._icon || '📍'} {selectedItem._label || selectedItem.name}</h3>
                  {selectedItem.distance_m && <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>📍 {selectedItem.distance_m}m away · ~{selectedItem.walk_minutes || Math.round(selectedItem.distance_m / 80)} min walk</p>}
                </div>
                <button onClick={() => setSelectedItem(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {selectedItem.available_now !== undefined && <span className={`badge ${selectedItem.available_now ? 'badge-green' : 'badge-red'}`}>{selectedItem.available_now ? '✓ Open' : '✗ Closed'}</span>}
                {selectedItem.status && <span className="badge badge-blue">{selectedItem.status}</span>}
                {selectedItem.estimated_queue_minutes && <span className="badge badge-yellow">Queue: {selectedItem.estimated_queue_minutes} min</span>}
                {selectedItem.capacity && <span className="badge badge-gray">Cap: {selectedItem.capacity}</span>}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ flex: 1 }}
                  onClick={() => setSelectedItem({ ...selectedItem, drawRoute: true })}
                >
                  🗺️ Get Directions
                </button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>📢 Share Location</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
