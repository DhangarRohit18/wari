'use client';
import { useEffect, useState, useRef } from 'react';
import { apiCall, getToken, getUser, createWebSocket } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';

interface Stats { total_users: number; active_varkaris: number; active_volunteers: number; }
interface Weather { temperature_c: number; condition: string; rain_probability_pct: number; alerts: any[]; }
interface Nearby { food: any[]; water: any[]; toilets: any[]; shelters: any[]; medical: any[]; wellness: any[]; }

const LAT = 17.6741;
const LON = 75.3279;

export default function VarkariHome() {
  const user = getUser();
  const token = getToken();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [nearby, setNearby] = useState<Nearby | null>(null);
  const [crowd, setCrowd] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, w, n, c, notifs] = await Promise.all([
          apiCall('/users/stats').catch(() => null),
          apiCall(`/weather?lat=${LAT}&lon=${LON}`).catch(() => null),
          apiCall(`/locations/nearby?lat=${LAT}&lon=${LON}&radius_km=5`).catch(() => null),
          apiCall('/crowd/current').catch(() => []),
          token ? apiCall('/notifications', {}, token).catch(() => []) : Promise.resolve([]),
        ]);
        setStats(s);
        setWeather(w);
        setNearby(n);
        setCrowd(c || []);
        setNotifications(notifs || []);
      } catch (e) {
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    // WebSocket for realtime updates
    const ws = createWebSocket(`varkari-${user?.id || 'anon'}`, (msg) => {
      if (msg.type === 'DEMO_EVENT') {
        if (msg.event === 'NETWORK_FAILURE') setIsOnline(false);
        if (msg.event === 'RESET') setIsOnline(true);
      }
    });
    wsRef.current = ws;

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => { ws.close(); };
  }, []);

  const crowdSummary = (crowd.length > 0 ? crowd[0]?.crowd_level : 'GREEN') as keyof typeof crowdColor;
  const totalPilgrims = crowd.reduce((a, z) => a + (z.estimated_count || 0), 0);

  const crowdColor = { GREEN: '#16A34A', YELLOW: '#CA8A04', ORANGE: '#EA580C', RED: '#DC2626' };
  const crowdLabel = { GREEN: 'Low Crowd', YELLOW: 'Moderate', ORANGE: 'Heavy Crowd', RED: '⚠️ Stampede Risk' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {!isOnline && (
          <div className="offline-banner">
            📡 OFFLINE MODE — SOS queued safely & will sync automatically
          </div>
        )}

        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('devotionalGreeting')}
              </h1>
              <p style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 500 }}>
                {t('welcome')}, {user?.display_name || 'Pilgrim'} · Pandharpur Wari 2024
              </p>
            </div>
            
            {/* Pilgrim Identity QR Code */}
            {user && (
              <div 
                style={{ background: 'white', padding: '0.25rem', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`Pilgrim Name: ${user.display_name}\nAadhar: 1234 5678 9012\nAddress: 45, Shivaji Nagar, Pune, Maharashtra\nBlood Group: O+\nEmergency Contact: +91 98220 12345 (Guardian)\nMedical Conditions: None\nStatus: Verified Varkari`)}`;
                  window.open(qrUrl, 'qrWindow', 'width=400,height=400,top=100,left=100');
                }}
                title="Pilgrim Identity QR - Click to enlarge for scanning"
              >
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(`Pilgrim Name: ${user.display_name}\nAadhar: 1234 5678 9012\nAddress: 45, Shivaji Nagar, Pune, Maharashtra\nBlood Group: O+\nEmergency Contact: +91 98220 12345 (Guardian)\nMedical Conditions: None\nStatus: Verified Varkari`)}`} 
                  alt="My QR ID" 
                  style={{ width: 44, height: 44, borderRadius: 4, display: 'block' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F172A' }}>My e-ID</span>
                  <span style={{ fontSize: '0.6rem', color: '#64748B' }}>Tap to scan</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {weather && (
              <div style={{ textAlign: 'right', fontSize: '0.825rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{weather.temperature_c.toFixed(1)}°C</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{weather.condition}</div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.35rem 0.75rem', borderRadius: 8 }}>
              <div className={`status-dot ${isOnline ? 'status-online' : 'status-offline'}`} />
              <span style={{ fontSize: '0.75rem', color: isOnline ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : (
            <>
              {/* Crowd Status Banner */}
              <div style={{ background: '#FFFFFF', border: `1.5px solid ${crowdColor[crowdSummary] || '#16A34A'}`, borderLeft: `6px solid ${crowdColor[crowdSummary] || '#16A34A'}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: crowdColor[crowdSummary] || '#16A34A', fontSize: '1rem' }}>
                    {crowdLabel[crowdSummary] || 'Normal Flow'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: 2 }}>
                    ~{totalPilgrims.toLocaleString()} pilgrims on pilgrimage route right now
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem' }}>
                  {crowdSummary === 'RED' ? '🔴' : crowdSummary === 'ORANGE' ? '🟠' : crowdSummary === 'YELLOW' ? '🟡' : '🟢'}
                </div>
              </div>

              {/* Weather Alert */}
              {weather?.alerts && weather.alerts.length > 0 && (
                <div style={{ background: '#FEF9C3', border: '1px solid #FEF08A', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>⛈️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#854D0E', fontSize: '0.875rem' }}>{weather.alerts[0].alert_type}</div>
                    <div style={{ fontSize: '0.8rem', color: '#713F12' }}>{weather.alerts[0].message}</div>
                  </div>
                </div>
              )}

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'map', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '🆘', labelKey: 'smartSos', path: '/dashboard/varkari/sos', border: '#EF4444' },
                    { icon: '👥', labelKey: 'wariConnect', path: '/dashboard/varkari/connect', border: '#16A34A' },
                    { icon: '🍛', labelKey: 'food', path: '/dashboard/varkari/food', border: '#D97706' },
                    { icon: '💧', labelKey: 'water', path: '/dashboard/varkari/water', border: '#2563EB' },
                    { icon: '🏥', labelKey: 'medical', path: '/dashboard/varkari/medical', border: '#DC2626' },
                    { icon: '🏠', labelKey: 'shelter', path: '/dashboard/varkari/shelter', border: '#7C3AED' },
                    { icon: '🚻', labelKey: 'toilets', path: '/dashboard/varkari/toilets', border: '#0891B2' },
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{t(labelKey)}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Nearby Services */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Nearest Food */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🍛</span>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Nearest Food / Annadan</span>
                  </div>
                  {nearby?.food?.[0] ? (
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{nearby.food[0].name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>
                        {nearby.food[0].distance_m}m away · {nearby.food[0].estimated_queue_minutes} min wait
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${nearby.food[0].available_now ? 'badge-green' : 'badge-red'}`}>
                          {nearby.food[0].available_now ? `✓ ${t('openNow')}` : `✗ ${t('closed')}`}
                        </span>
                      </div>
                    </div>
                  ) : <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Searching nearest...</div>}
                </div>

                {/* Nearest Water */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💧</span>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Nearest Water Point</span>
                  </div>
                  {nearby?.water?.[0] ? (
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{nearby.water[0].name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>{nearby.water[0].distance_m}m away</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${nearby.water[0].status === 'AVAILABLE' ? 'badge-green' : nearby.water[0].status === 'LOW' ? 'badge-yellow' : 'badge-red'}`}>
                          {nearby.water[0].status}
                        </span>
                      </div>
                    </div>
                  ) : <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Searching nearest...</div>}
                </div>

                {/* Nearest Medical */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏥</span>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Nearest Medical Camp</span>
                  </div>
                  {nearby?.medical?.[0] ? (
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{nearby.medical[0].name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>
                        {nearby.medical[0].distance_m}m · {nearby.medical[0].location_type}
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${nearby.medical[0].available ? 'badge-green' : 'badge-red'}`}>
                          {nearby.medical[0].available ? `✓ ${t('available')}` : `✗ ${t('closed')}`}
                        </span>
                      </div>
                    </div>
                  ) : <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Searching nearest...</div>}
                </div>

                {/* Nearest Clean Toilet */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🚻</span>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Nearest Clean Sanitation</span>
                  </div>
                  {nearby?.toilets?.[0] ? (
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>{nearby.toilets[0].name}</div>
                      <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>
                        {nearby.toilets[0].distance_m}m · Cleaned {nearby.toilets[0].minutes_since_cleaned} min ago
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${nearby.toilets[0].status === 'CLEAN' ? 'badge-green' : 'badge-yellow'}`}>
                          {nearby.toilets[0].status}
                        </span>
                      </div>
                    </div>
                  ) : <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Searching nearest...</div>}
                </div>
              </div>

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="card">
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>🔔 {t('alerts')}</h3>
                  <div>
                    {notifications.slice(0, 4).map((n: any) => (
                      <div key={n.id} className="list-item" style={{ borderRadius: 8, marginBottom: '0.25rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>{n.title}</div>
                          <div style={{ color: '#475569', fontSize: '0.8rem' }}>{n.message}</div>
                        </div>
                        <span className={`badge ${n.priority === 'CRITICAL' ? 'badge-red' : n.priority === 'HIGH' ? 'badge-orange' : 'badge-gray'}`}>
                          {n.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating SOS Button */}
        <div className="floating-sos">
          <button className="btn-sos" onClick={() => window.location.href = '/dashboard/varkari/sos'} title="Smart SOS">
            SOS
          </button>
        </div>
      </main>
    </div>
  );
}
