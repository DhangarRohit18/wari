'use client';
import { useState, useEffect, useRef } from 'react';
import { apiCall, getToken, getUser, createWebSocket } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
  const token = getToken();
  const user = getUser();
  const [analytics, setAnalytics] = useState<any>(null);
  const [sosFeed, setSosFeed] = useState<any[]>([]);
  const [crowdZones, setCrowdZones] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [resourcePrediction, setResourcePrediction] = useState<any>(null);
  const [lostPersons, setLostPersons] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const addToast = (title: string, msg: string, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-3), { id, title, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [a, sos, crowd, pred, res, lost, postsData] = await Promise.all([
          apiCall('/admin/analytics', {}, token),
          apiCall('/sos', {}, token),
          apiCall('/crowd/current'),
          apiCall('/crowd/prediction'),
          apiCall('/resources/prediction'),
          apiCall('/lost-person'),
          apiCall('/community/posts?lat=17.6741&lon=75.3279&radius_km=50'),
        ]);
        setAnalytics(a);
        setSosFeed(sos.slice(0, 10));
        setCrowdZones(crowd);
        setPrediction(pred);
        setResourcePrediction(res);
        setLostPersons(lost.filter((l: any) => l.status === 'MISSING'));
        setPosts(postsData.slice(0, 8));
      } catch (e: any) {
        addToast('Error', e.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    const ws = createWebSocket(`admin-${user?.id}`, (msg) => {
      if (msg.type === 'NEW_SOS') {
        addToast('🆘 NEW SOS!', `${msg.data.category} at ${msg.data.latitude.toFixed(4)}, ${msg.data.longitude.toFixed(4)}`, 'critical');
        setSosFeed(prev => [msg.data, ...prev.slice(0, 9)]);
      }
      if (msg.type === 'DEMO_EVENT') {
        addToast(`🎮 ${msg.event}`, msg.data.message || 'Demo event triggered', 'info');
        // Refresh data
        fetchAll();
      }
      if (msg.type === 'CROWD_UPDATE') {
        setCrowdZones(prev => prev.map(z => z.id === msg.data.id ? msg.data : z));
      }
    });
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const statsConfig = analytics ? [
    { label: 'Active Varkaris', value: analytics.active_varkaris.toLocaleString(), icon: '🙏', color: '#F97316', sub: 'On pilgrimage today' },
    { label: 'Active SOS', value: analytics.active_sos, icon: '🆘', color: '#EF4444', sub: analytics.total_sos + ' total incidents' },
    { label: 'Red Zones', value: analytics.red_zones, icon: '🔴', color: '#EF4444', sub: analytics.total_crowd_zones + ' total zones' },
    { label: 'Volunteers', value: analytics.active_volunteers, icon: '🤝', color: '#22C55E', sub: 'Available now' },
    { label: 'Food Centres Open', value: analytics.food_centres_open, icon: '🍛', color: '#F97316', sub: 'Serving pilgrims' },
    { label: 'Water Points', value: analytics.water_points_available, icon: '💧', color: '#3B82F6', sub: 'Available now' },
    { label: 'Missing Persons', value: analytics.lost_persons_missing, icon: '👤', color: '#EC4899', sub: 'Active cases' },
    { label: 'Pilgrims (Est.)', value: analytics.total_pilgrims_estimate.toLocaleString(), icon: '📊', color: '#6366F1', sub: 'DEMO DATA' },
  ] : [];

  const sosStatusColor: Record<string, string> = {
    CREATED: '#EF4444', ACKNOWLEDGED: '#F59E0B', VOLUNTEER_ASSIGNED: '#3B82F6',
    MEDICAL_ASSIGNED: '#8B5CF6', IN_PROGRESS: '#F97316', RESOLVED: '#22C55E', CANCELLED: '#9CA3AF',
  };
  const crowdColor: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Toast notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type === 'critical' ? 'toast-critical' : ''}`}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t.msg}</div>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
          ))}
        </div>

        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
              ⚙️ WariVerse AI Command Center
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Real-time situational awareness · {analytics ? new Date(analytics.timestamp).toLocaleTimeString() : '—'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a href="/dashboard/admin/demo" className="btn btn-secondary btn-sm">🎮 Demo Control</a>
            <a href="/dashboard/admin/digital-twin" className="btn btn-primary btn-sm">🗺️ Digital Twin</a>
          </div>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <div className="spinner" style={{ width: 50, height: 50 }} />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {statsConfig.map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Digital Twin', path: '/dashboard/admin/digital-twin', border: '#3B82F6' },
                    { icon: '📈', labelKey: 'Analytics', path: '/dashboard/admin/analytics', border: '#8B5CF6' },
                    { icon: '👥', labelKey: 'Users', path: '/dashboard/admin/users', border: '#14B8A6' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>
<div className="stat-label">{s.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{s.sub}</div>
                      </div>
                      <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Live SOS Feed */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>🆘 Live SOS Feed</h3>
                    <a href="/dashboard/admin/sos" className="btn btn-ghost btn-sm">View All</a>
                  </div>
                  {sosFeed.length === 0 ? (
                    <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '1.5rem' }}>No active SOS incidents</div>
                  ) : (
                    <div>
                      {sosFeed.slice(0, 5).map((sos: any) => (
                        <div key={sos.id} className={`list-item sos-card card-sm ${sos.status === 'RESOLVED' ? 'sos-card-resolved' : sos.status === 'IN_PROGRESS' ? 'sos-card-in_progress' : ''}`}
                          style={{ borderRadius: 8, marginBottom: '0.375rem', padding: '0.625rem 0.75rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{sos.category} · {sos.description?.slice(0, 40) || '—'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                              {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)} · {sos.is_offline ? '📡 Offline' : '🌐 Online'}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sosStatusColor[sos.status] || '#6B7280' }}>{sos.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Crowd Zones */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>🚦 Crowd Zones</h3>
                    <a href="/dashboard/admin/predictions" className="btn btn-ghost btn-sm">AI Predict</a>
                  </div>
                  {crowdZones.map((zone: any) => (
                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: crowdColor[zone.crowd_level], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {zone.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{zone.estimated_count.toLocaleString()} people · {(zone.current_density * 100).toFixed(0)}%</div>
                      </div>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${zone.current_density * 100}%`, background: crowdColor[zone.crowd_level] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* AI Resource Prediction */}
                {resourcePrediction && (
                  <div className="prediction-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ color: 'white' }}>🤖 AI Resource Prediction</h3>
                      <span className="prediction-badge">DEMO</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.875rem' }}>
                        <div style={{ color: '#9CA3AF', fontSize: '0.7rem', marginBottom: '0.25rem' }}>🍛 FOOD DEMAND</div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>{resourcePrediction.food.demand_meals.toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>meals needed</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: resourcePrediction.food.shortage_risk === 'HIGH' ? '#EF4444' : '#22C55E' }}>
                            {resourcePrediction.food.shortage_risk} RISK
                          </span>
                        </div>
                        {resourcePrediction.food.shortage_meals > 0 && (
                          <div style={{ marginTop: '0.375rem', fontSize: '0.7rem', color: '#FB923C' }}>
                            ⚠️ {resourcePrediction.food.shortage_meals.toLocaleString()} meal shortage
                          </div>
                        )}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.875rem' }}>
                        <div style={{ color: '#9CA3AF', fontSize: '0.7rem', marginBottom: '0.25rem' }}>💧 WATER SUPPLY</div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>{resourcePrediction.water.available_points}/{resourcePrediction.water.total_points}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>points available</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: resourcePrediction.water.shortage_risk === 'HIGH' ? '#EF4444' : '#22C55E' }}>
                            {resourcePrediction.water.shortage_risk} RISK
                          </span>
                        </div>
                      </div>
                    </div>
                    {resourcePrediction.food.recommendation && (
                      <div style={{ marginTop: '1rem', background: 'rgba(249,115,22,0.15)', borderRadius: 8, padding: '0.75rem', border: '1px solid rgba(249,115,22,0.3)' }}>
                        <div style={{ color: '#FB923C', fontSize: '0.75rem', fontWeight: 700 }}>🎯 RECOMMENDATION</div>
                        <div style={{ color: '#FED7AA', fontSize: '0.8rem', marginTop: '0.25rem' }}>{resourcePrediction.food.recommendation}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lost Persons */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>👤 Missing Persons</h3>
                    <a href="/dashboard/admin/lost" className="btn btn-ghost btn-sm">View All</a>
                  </div>
                  {lostPersons.length === 0 ? (
                    <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '1.5rem' }}>No missing person cases</div>
                  ) : (
                    lostPersons.slice(0, 4).map((lp: any) => (
                      <div key={lp.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                          {lp.gender === 'female' ? '👩' : '👴'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{lp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Age {lp.age} · {lp.description?.slice(0, 50)}</div>
                          <div style={{ fontSize: '0.7rem' }}>
                            <span className={`badge ${lp.status === 'FOUND' ? 'badge-green' : 'badge-red'}`}>{lp.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Community Posts */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>📢 Wari Connect Activity</h3>
                  <a href="/dashboard/admin/community" className="btn btn-ghost btn-sm">Moderate</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {posts.slice(0, 6).map((post: any) => (
                    <div key={post.id} className="card card-sm" style={{ background: '#F9FAFB', fontSize: '0.8rem', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge badge-${post.post_type === 'ROUTE_WARNING' || post.post_type === 'WEATHER_WARNING' ? 'yellow' : 'blue'}`} style={{ fontSize: '0.65rem' }}>
                          {post.post_type}
                        </span>
                        {post.is_verified && <span style={{ fontSize: '0.7rem', color: '#22C55E' }}>✓</span>}
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
