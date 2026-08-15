'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function VarkariAlertsPage() {
  const token = getToken();
  const [weather, setWeather] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [crowdAlerts, setCrowdAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [w, notifs, zones] = await Promise.all([
        apiCall('/weather'),
        apiCall('/notifications', {}, token).catch(() => []),
        apiCall('/crowd/current'),
      ]);
      setWeather(w);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setCrowdAlerts(zones.filter((z: any) => ['RED', 'ORANGE'].includes(z.crowd_level)));
      setLoading(false);
    };
    fetchAll();
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PUT' }, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    for (const n of notifications.filter(n => !n.is_read)) {
      await markRead(n.id);
    }
    setMarkingAll(false);
  };

  const unread = notifications.filter(n => !n.is_read).length;

  const rainRisk = weather?.rain_probability_pct > 60;
  const heatRisk = weather?.feels_like_c > 40;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🔔 Alerts & Notifications</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>सूचना — Weather, crowd, and safety alerts</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {unread > 0 && <span className="badge badge-red">{unread} unread</span>}
            {unread > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead} disabled={markingAll}>
                {markingAll ? '⏳' : '✓ Mark All Read'}
              </button>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <>
              {/* Weather Widget */}
              {weather && (
                <div className="prediction-card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>⛅</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Current Weather — Wari Route</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{weather.condition}</div>
                    </div>
                    <span className="prediction-badge">LIVE</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '0.75rem' }}>
                    {[
                      { icon: '🌡️', label: 'Feels Like', value: `${weather.feels_like_c?.toFixed(0)}°C` },
                      { icon: '💧', label: 'Humidity', value: `${weather.humidity_pct}%` },
                      { icon: '🌧️', label: 'Rain', value: `${weather.rain_probability_pct}%` },
                      { icon: '💨', label: 'Wind', value: `${weather.wind_kmh?.toFixed(0)} km/h` },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem' }}>{item.icon}</div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{item.value}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {rainRisk && (
                      <div style={{ background: '#3B82F620', border: '1px solid #3B82F6', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#93C5FD' }}>
                        🌧️ Rain likely — carry a raincoat or umbrella
                      </div>
                    )}
                    {heatRisk && (
                      <div style={{ background: '#EF444420', border: '1px solid #EF4444', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#FCA5A5' }}>
                        🔥 Extreme heat — stay hydrated, seek shade
                      </div>
                    )}
                    {weather.alerts?.map((a: any) => (
                      <div key={a.id} style={{ background: '#EF444420', border: '1px solid #EF4444', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 700 }}>
                        🚨 {a.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crowd Alerts */}
              {crowdAlerts.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>🚦 Crowd Density Alerts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {crowdAlerts.map((z: any) => (
                      <div key={z.id} className="card card-sm" style={{ borderLeft: `4px solid ${z.crowd_level === 'RED' ? '#EF4444' : '#F97316'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{z.name}</span>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.125rem' }}>
                              Density: {((z.current_density || 0) * 100).toFixed(0)}% · ~{z.estimated_count?.toLocaleString()} pilgrims
                            </div>
                          </div>
                          <span className={`badge ${z.crowd_level === 'RED' ? 'badge-red' : 'badge-orange'}`}>
                            {z.crowd_level === 'RED' ? '🔴 CRITICAL' : '🟠 HIGH'}
                          </span>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: z.crowd_level === 'RED' ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                          {z.crowd_level === 'RED' ? '⚠️ Avoid this area — high stampede risk' : '⚠️ High density — proceed with caution'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3>🔔 Notifications</h3>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{notifications.length} total</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔕</div>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map((n: any) => (
                      <div key={n.id} className="card card-sm" style={{
                        borderLeft: `4px solid ${n.is_read ? '#E5E7EB' : '#F97316'}`,
                        background: n.is_read ? '#F9FAFB' : 'white',
                        opacity: n.is_read ? 0.8 : 1,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {n.title || n.message || 'Notification'}
                            </div>
                            {n.body && <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{n.body}</div>}
                            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                          {!n.is_read && (
                            <button className="btn btn-sm btn-secondary" style={{ marginLeft: '1rem', flexShrink: 0 }} onClick={() => markRead(n.id)}>
                              ✓ Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
