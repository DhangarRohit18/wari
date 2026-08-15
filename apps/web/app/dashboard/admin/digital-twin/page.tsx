'use client';
import { useState, useEffect, useRef } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';

const CROWD_COLORS: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };

const MAP_LAYERS = [
  { id: 'crowd', label: '🚦 Crowd', color: '#EF4444' },
  { id: 'sos', label: '🆘 SOS', color: '#EF4444' },
  { id: 'food', label: '🍛 Food', color: '#F97316' },
  { id: 'water', label: '💧 Water', color: '#3B82F6' },
  { id: 'medical', label: '🏥 Medical', color: '#8B5CF6' },
  { id: 'toilets', label: '🚻 Toilets', color: '#06B6D4' },
  { id: 'shelters', label: '🏠 Shelters', color: '#6366F1' },
  { id: 'relay', label: '📡 Relay', color: '#22C55E' },
  { id: 'lost', label: '👤 Lost', color: '#EC4899' },
  { id: 'users', label: '🚶 Users', color: '#10B981' },
];

const DUMMY_USERS = [
  { id: 'u1', latitude: 17.685, longitude: 75.312, name: 'Varkari Group A', status: 'Walking' },
  { id: 'u2', latitude: 17.662, longitude: 75.335, name: 'Volunteer B', status: 'At Food Tent' },
  { id: 'u3', latitude: 17.678, longitude: 75.305, name: 'Medical Team 1', status: 'Available' },
  { id: 'u4', latitude: 17.695, longitude: 75.342, name: 'Varkari Group C', status: 'Resting' },
  { id: 'u5', latitude: 17.655, longitude: 75.318, name: 'Pilgrim D', status: 'Walking' },
];

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('@/app/dashboard/admin/digital-twin/LeafletMap'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', borderRadius: 16 }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
      <div style={{ color: '#6B7280' }}>Loading map...</div>
    </div>
  </div>
)});

export default function DigitalTwinPage() {
  const token = getToken();
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['crowd', 'sos', 'food', 'water', 'medical', 'users']));
  const [crowdZones, setCrowdZones] = useState<any[]>([]);
  const [sosFeed, setSosFeed] = useState<any[]>([]);
  const [food, setFood] = useState<any[]>([]);
  const [water, setWater] = useState<any[]>([]);
  const [medical, setMedical] = useState<any[]>([]);
  const [toilets, setToilets] = useState<any[]>([]);
  const [relayNodes, setRelayNodes] = useState<any[]>([]);
  const [lost, setLost] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cz, sos, f, w, m, t, rn, lp, sh, pred] = await Promise.all([
          apiCall('/crowd/current').catch(() => []),
          apiCall('/sos', {}, token).catch(() => []),
          apiCall('/food').catch(() => []),
          apiCall('/water').catch(() => []),
          apiCall('/medical').catch(() => []),
          apiCall('/toilets').catch(() => []),
          apiCall('/relay/nodes').catch(() => []),
          apiCall('/lost-person').catch(() => []),
          apiCall('/shelters').catch(() => []),
          apiCall('/crowd/prediction').catch(() => null),
        ]);
        setCrowdZones(cz);
        setSosFeed(sos);
        setFood(f);
        setWater(w);
        setMedical(m);
        setToilets(t);
        setRelayNodes(rn);
        setLost(lp);
        setShelters(sh);
        setPrediction(pred);
      } catch {}
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const redZones = crowdZones.filter(z => z.crowd_level === 'RED');
  const orangeZones = crowdZones.filter(z => z.crowd_level === 'ORANGE');

  // Build markers array for the map
  const markers: any[] = [];
  if (activeLayers.has('crowd')) {
    crowdZones.forEach(z => markers.push({ lat: z.latitude, lon: z.longitude, color: CROWD_COLORS[z.crowd_level] || '#22C55E', icon: '🚦', label: z.name, data: z, layer: 'crowd' }));
  }
  if (activeLayers.has('sos')) {
    sosFeed.filter(s => !['RESOLVED', 'CANCELLED'].includes(s.status)).forEach(s => markers.push({ lat: s.latitude, lon: s.longitude, color: '#EF4444', icon: '🆘', label: `SOS: ${s.category}`, data: s, layer: 'sos' }));
  }
  if (activeLayers.has('food')) {
    food.filter(f => f.available_now).forEach(f => markers.push({ lat: f.latitude, lon: f.longitude, color: '#F97316', icon: '🍛', label: f.name, data: f, layer: 'food' }));
  }
  if (activeLayers.has('water')) {
    water.forEach(wp => {
      const c = wp.status === 'AVAILABLE' ? '#3B82F6' : wp.status === 'LOW' ? '#F59E0B' : '#EF4444';
      markers.push({ lat: wp.latitude, lon: wp.longitude, color: c, icon: '💧', label: wp.name, data: wp, layer: 'water' });
    });
  }
  if (activeLayers.has('medical')) {
    medical.forEach(m => markers.push({ lat: m.latitude, lon: m.longitude, color: '#8B5CF6', icon: '🏥', label: m.name, data: m, layer: 'medical' }));
  }
  if (activeLayers.has('toilets')) {
    toilets.forEach(t => {
      const c = t.status === 'CLEAN' ? '#06B6D4' : t.status === 'NEEDS_CLEANING' ? '#F59E0B' : '#EF4444';
      markers.push({ lat: t.latitude, lon: t.longitude, color: c, icon: '🚻', label: t.name, data: t, layer: 'toilets' });
    });
  }
  if (activeLayers.has('relay')) {
    relayNodes.forEach(rn => markers.push({ lat: rn.latitude, lon: rn.longitude, color: rn.is_online ? '#22C55E' : '#6B7280', icon: rn.is_gateway ? '🏗️' : '📡', label: rn.name, data: rn, layer: 'relay' }));
  }
  if (activeLayers.has('shelters')) {
    shelters.forEach(s => markers.push({ lat: s.latitude, lon: s.longitude, color: '#6366F1', icon: '🏠', label: s.name, data: s, layer: 'shelters' }));
  }
  if (activeLayers.has('lost')) {
    lost.filter(l => l.status === 'MISSING').forEach(lp => markers.push({ lat: lp.last_seen_latitude || 17.67, lon: lp.last_seen_longitude || 75.33, color: '#EC4899', icon: '👤', label: `Missing: ${lp.name}`, data: lp, layer: 'lost' }));
  }
  if (activeLayers.has('users')) {
    DUMMY_USERS.forEach(u => markers.push({ lat: u.latitude, lon: u.longitude, color: '#10B981', icon: '🚶', label: u.name, data: { ...u, layer: 'users' }, layer: 'users' }));
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900 }}>🗺️ Digital Twin — Live Map</h1>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Real-time Wari pilgrimage visualization · DEMO DATA</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {redZones.length > 0 && <span className="badge badge-red">🔴 {redZones.length} RED zones</span>}
            {orangeZones.length > 0 && <span className="badge badge-orange">🟠 {orangeZones.length} ORANGE zones</span>}
          </div>
        </header>

        <div className="dashboard-content" style={{ padding: '1rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Layer Controls */}
          <div className="layer-controls">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', marginRight: '0.5rem' }}>Layers:</span>
            {MAP_LAYERS.map(layer => (
              <button key={layer.id} className={`layer-toggle ${activeLayers.has(layer.id) ? 'active' : ''}`} onClick={() => toggleLayer(layer.id)}>
                <div className="layer-dot" style={{ background: layer.color }} />
                {layer.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', minHeight: 0 }}>
            {/* Map */}
            <div className="map-container" style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
              {loading && (
                <div style={{ position: 'absolute', inset: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, borderRadius: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
                    <div style={{ color: '#6B7280' }}>Loading Digital Twin...</div>
                  </div>
                </div>
              )}
              <LeafletMap
                markers={markers}
                center={[17.6741, 75.3279]}
                zoom={11}
                onMarkerClick={(data: any) => setSelectedItem(data)}
                selectedItem={selectedItem}
              />

              {/* Crowd Legend */}
              <div style={{ position: 'absolute', bottom: 32, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '0.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', fontSize: '0.7rem', zIndex: 999 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Crowd Level</div>
                {Object.entries(CROWD_COLORS).map(([level, color]) => (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                    <span>{level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
              {/* Selected Item */}
              {selectedItem && (
                <div className="card card-sm" style={{ border: '2px solid #F97316' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedItem._icon} {selectedItem._label || selectedItem.name}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItem(null)}>✕</button>
                  </div>
                  {selectedItem.status && <span className={`badge ${selectedItem.status === 'CLEAN' || selectedItem.status === 'AVAILABLE' ? 'badge-green' : 'badge-yellow'}`}>{selectedItem.status}</span>}
                  {selectedItem.crowd_level && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      <div>Level: <strong style={{ color: CROWD_COLORS[selectedItem.crowd_level] }}>{selectedItem.crowd_level}</strong></div>
                      <div>Density: {((selectedItem.current_density || 0) * 100).toFixed(0)}%</div>
                      <div>Pilgrims: ~{selectedItem.estimated_count?.toLocaleString()}</div>
                    </div>
                  )}
                  {selectedItem.available_now !== undefined && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      {selectedItem.available_now ? '✅ Open' : '❌ Closed'} · Queue: {selectedItem.estimated_queue_minutes} min
                    </div>
                  )}
                  {selectedItem.category && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#EF4444', fontWeight: 600 }}>
                      🆘 {selectedItem.category} · {selectedItem.description?.slice(0, 60) || ''}
                    </div>
                  )}
                </div>
              )}

              {/* Zone Summary */}
              <div className="card card-sm">
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>🚦 Zone Summary</div>
                {Object.entries(CROWD_COLORS).map(([level, color]) => {
                  const count = crowdZones.filter(z => z.crowd_level === level).length;
                  return (
                    <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        {level}
                      </div>
                      <span style={{ fontWeight: 700, color, fontSize: '0.875rem' }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* AI Prediction */}
              {prediction && (
                <div className="prediction-card card-sm">
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem', marginBottom: '0.75rem' }}>🤖 AI Crowd Prediction</div>
                  {prediction.predictions?.slice(0, 4).map((p: any) => (
                    <div key={p.zone_id} style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.zone_name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{(p.predicted_density_30min * 100).toFixed(0)}%</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: p.risk_level === 'HIGH' ? '#EF4444' : p.risk_level === 'MEDIUM' ? '#F59E0B' : '#22C55E' }}>
                          {p.risk_level}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{p.recommendation}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.6rem', color: '#6B7280', textAlign: 'center' }}>DEMO PREDICTION v1 · 78% confidence</div>
                </div>
              )}

              {/* Live Stats */}
              <div className="card card-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div><div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F97316' }}>{food.filter(f => f.available_now).length}</div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Food Open</div></div>
                <div><div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6' }}>{water.filter(w => w.status === 'AVAILABLE').length}</div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Water OK</div></div>
                <div><div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B5CF6' }}>{medical.filter(m => m.available).length}</div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Medical</div></div>
                <div><div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>{sosFeed.filter(s => s.status === 'CREATED').length}</div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Active SOS</div></div>
              </div>

              {/* Marker count */}
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center' }}>
                {markers.length} markers on map · Auto-refreshes every 15s
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
