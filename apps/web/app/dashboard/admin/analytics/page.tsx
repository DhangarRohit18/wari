'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminAnalyticsPage() {
  const token = getToken();
  const [analytics, setAnalytics] = useState<any>(null);
  const [crowd, setCrowd] = useState<any[]>([]);
  const [sos, setSos] = useState<any[]>([]);
  const [food, setFood] = useState<any[]>([]);
  const [water, setWater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    setRefreshing(true);
    try {
      const [a, c, s, f, w] = await Promise.all([
        apiCall('/admin/analytics', {}, token),
        apiCall('/crowd/current'),
        apiCall('/sos', {}, token),
        apiCall('/food'),
        apiCall('/water'),
      ]);
      setAnalytics(a);
      setCrowd(c);
      setSos(s);
      setFood(f);
      setWater(w);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const redZones = crowd.filter(z => z.crowd_level === 'RED').length;
  const orangeZones = crowd.filter(z => z.crowd_level === 'ORANGE').length;
  const totalPilgrims = crowd.reduce((a, z) => a + (z.estimated_count || 0), 0);
  const activeSOSCount = sos.filter(s => !['RESOLVED', 'CANCELLED'].includes(s.status)).length;
  const resolvedSOS = sos.filter(s => s.status === 'RESOLVED').length;
  const openFoodCentres = food.filter(f => f.available_now).length;
  const waterAvailable = water.filter(w => w.status === 'AVAILABLE').length;
  const waterEmpty = water.filter(w => w.status === 'EMPTY').length;

  const SOS_CATS = ['MEDICAL', 'DEHYDRATION', 'FATIGUE', 'ACCIDENT', 'LOST', 'WOMEN_SAFETY', 'OTHER'];
  const CAT_COLOR: Record<string, string> = {
    MEDICAL: '#EF4444', DEHYDRATION: '#3B82F6', FATIGUE: '#F59E0B',
    ACCIDENT: '#8B5CF6', LOST: '#EC4899', WOMEN_SAFETY: '#F97316', OTHER: '#9CA3AF',
  };

  const CROWD_LEVEL_COLORS: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📊 Analytics Dashboard</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Admin — Real-time situational awareness · {analytics ? new Date(analytics.timestamp).toLocaleTimeString() : '—'}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchAll} disabled={refreshing}>
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 48, height: 48, margin: 'auto' }} /></div>
          ) : (
            <>
              {/* Top-level KPIs */}
              {analytics && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Active Varkaris', value: analytics.active_varkaris?.toLocaleString(), color: '#F97316', icon: '🙏', sub: 'On pilgrimage today' },
                    { label: 'Active SOS', value: activeSOSCount, color: '#EF4444', icon: '🆘', sub: `${resolvedSOS} resolved` },
                    { label: 'Crowd Alerts', value: redZones + orangeZones, color: redZones > 0 ? '#EF4444' : '#F97316', icon: '🚦', sub: `${redZones} RED, ${orangeZones} ORANGE` },
                    { label: 'Est. Pilgrims Now', value: (analytics.total_pilgrims_estimate || totalPilgrims).toLocaleString(), color: '#6366F1', icon: '👥', sub: 'DEMO estimate' },
                  ].map(s => (
                    <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                          <div className="stat-value" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                        <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* SOS Breakdown */}
                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>🆘 SOS by Category</h3>
                  {SOS_CATS.map(cat => {
                    const count = sos.filter(s => s.category === cat).length;
                    const active = sos.filter(s => s.category === cat && !['RESOLVED', 'CANCELLED'].includes(s.status)).length;
                    if (count === 0) return null;
                    return (
                      <div key={cat} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: CAT_COLOR[cat] }}>{cat}</span>
                          <span>{active} active / {count} total</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(count / Math.max(sos.length, 1)) * 100}%`, background: CAT_COLOR[cat] }} />
                        </div>
                      </div>
                    );
                  })}
                  {sos.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center' }}>No SOS incidents</p>}
                </div>

                {/* Crowd Zones */}
                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>🚦 Crowd Zone Distribution</h3>
                  {['RED', 'ORANGE', 'YELLOW', 'GREEN'].map(level => {
                    const count = crowd.filter(z => z.crowd_level === level).length;
                    if (count === 0 && level !== 'GREEN') return null;
                    return (
                      <div key={level} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: CROWD_LEVEL_COLORS[level] }}>{level}</span>
                          <span>{count} zone(s)</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(count / Math.max(crowd.length, 1)) * 100}%`, background: CROWD_LEVEL_COLORS[level] }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total zones: {crowd.length}</span>
                    <span>Est. pilgrims: {totalPilgrims.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Food & Water */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>🍛 Food Centre Status</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#22C55E' }}>{openFoodCentres}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Open</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#EF4444' }}>{food.length - openFoodCentres}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Closed</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#F97316' }}>{food.reduce((a, f) => a + f.current_count, 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Served</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(openFoodCentres / Math.max(food.length, 1)) * 100}%`, background: '#F97316' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{openFoodCentres}/{food.length} centres operational</div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>💧 Water Supply Status</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#22C55E' }}>{waterAvailable}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Available</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#F59E0B' }}>{water.filter(w => w.status === 'LOW').length}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Low</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#EF4444' }}>{waterEmpty}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Empty</div>
                    </div>
                  </div>
                  {waterEmpty > 0 && (
                    <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>
                      🔴 {waterEmpty} water point(s) empty — dispatch refill
                    </div>
                  )}
                  <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${(waterAvailable / Math.max(water.length, 1)) * 100}%`, background: '#3B82F6' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{waterAvailable}/{water.length} points available</div>
                </div>
              </div>

              {/* Quick links */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🔗 Quick Navigation</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '🎭 Demo Control', path: '/dashboard/admin/demo' },
                    { label: '🌐 Digital Twin', path: '/dashboard/admin/digital-twin' },
                    { label: '🔮 Predictions', path: '/dashboard/admin/predictions' },
                    { label: '🆘 SOS Monitor', path: '/dashboard/admin/sos' },
                    { label: '👥 User Management', path: '/dashboard/admin/users' },
                    { label: '🍛 Food Centres', path: '/dashboard/admin/food' },
                    { label: '💧 Water Points', path: '/dashboard/admin/water' },
                    { label: '👤 Missing Persons', path: '/dashboard/admin/lost' },
                    { label: '🚻 Toilets', path: '/dashboard/admin/toilets' },
                    { label: '📢 Community', path: '/dashboard/admin/community' },
                  ].map(link => (
                    <a key={link.path} href={link.path} className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}>{link.label}</a>
                  ))}
                </div>
              </div>

              {analytics && (
                <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center' }}>
                  Data timestamp: {new Date(analytics.timestamp).toLocaleString()} · DEMO DATA may not reflect real metrics
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
