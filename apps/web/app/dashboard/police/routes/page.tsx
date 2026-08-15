'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const WARNING_TYPES = ['ROUTE_WARNING', 'WEATHER_WARNING'];

export default function PoliceRoutesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall('/community/posts?lat=17.6741&lon=75.3279&radius_km=100'),
      apiCall('/weather'),
    ]).then(([p, w]) => {
      setPosts(p.filter((post: any) => WARNING_TYPES.includes(post.post_type)));
      setWeather(w);
      setLoading(false);
    });
  }, []);

  const routeWarnings = posts.filter(p => p.post_type === 'ROUTE_WARNING');
  const weatherWarnings = posts.filter(p => p.post_type === 'WEATHER_WARNING');

  const timeAgo = (dt: string) => {
    const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>⚠️ Route & Weather Alerts</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Police — community-reported route warnings</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-orange">{routeWarnings.length} Route</span>
            <span className="badge badge-blue">{weatherWarnings.length} Weather</span>
          </div>
        </header>
        <div className="dashboard-content">
          {/* Weather widget */}
          {weather && (
            <div className="prediction-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⛅</span>
                <div style={{ color: 'white', fontWeight: 700 }}>Current Weather</div>
                <span className="prediction-badge">LIVE</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Temp', value: `${weather.temperature_c?.toFixed(1)}°C` },
                  { label: 'Humidity', value: `${weather.humidity_pct}%` },
                  { label: 'Rain', value: `${weather.rain_probability_pct}%` },
                  { label: 'Condition', value: weather.condition },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{item.label}</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {weather.alerts?.length > 0 && (
                <div style={{ marginTop: '0.75rem', background: '#EF444420', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                  {weather.alerts.map((a: any) => (
                    <div key={a.id} style={{ fontSize: '0.85rem', color: '#FCA5A5', fontWeight: 600 }}>🚨 {a.message}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#F59E0B' }}>⚠️ Route Warnings ({routeWarnings.length})</h3>
                {routeWarnings.length === 0 ? <p style={{ color: '#9CA3AF' }}>No route warnings reported</p> : routeWarnings.map((p: any) => (
                  <div key={p.id} className="card card-sm" style={{ marginBottom: '0.75rem', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{p.message}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      By {p.author_name} · {timeAgo(p.created_at)} · 📍 {p.distance_m}m away
                    </div>
                    {p.is_verified && <span className="badge badge-green" style={{ marginTop: '0.375rem', fontSize: '0.65rem' }}>✓ Verified</span>}
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#6366F1' }}>⛈️ Weather Warnings ({weatherWarnings.length})</h3>
                {weatherWarnings.length === 0 ? <p style={{ color: '#9CA3AF' }}>No weather warnings reported</p> : weatherWarnings.map((p: any) => (
                  <div key={p.id} className="card card-sm" style={{ marginBottom: '0.75rem', borderLeft: '4px solid #6366F1' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{p.message}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      By {p.author_name} · {timeAgo(p.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
