'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function NGODashboard() {
  const token = getToken();
  const [food, setFood] = useState<any[]>([]);
  const [water, setWater] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([apiCall('/food'), apiCall('/water'), apiCall('/shelters'), apiCall('/help/needs')]).then(([f, w, s, n]) => {
      setFood(f); setWater(w); setShelters(s); setNeeds(n); setLoading(false);
    });
  }, []);
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🌿 NGO Dashboard</h1>
          <span className="badge badge-green">Resource Coordination</span>
        </header>
        <div className="dashboard-content">

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '🤝', labelKey: 'Volunteers', path: '/dashboard/ngo/volunteers', border: '#F97316' },
                    { icon: '📦', labelKey: 'Resources', path: '/dashboard/ngo/resources', border: '#2563EB' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Food Centres', value: food.filter(f => f.available_now).length + '/' + food.length, color: '#F97316', icon: '🍛' },
              { label: 'Water Points', value: water.filter(w => w.status === 'AVAILABLE').length + '/' + water.length, color: '#3B82F6', icon: '💧' },
              { label: 'Shelter Capacity', value: shelters.reduce((a, s) => a + (s.capacity - s.current_occupancy), 0).toLocaleString(), color: '#6366F1', icon: '🏠' },
              { label: 'Help Requests', value: needs.length, color: '#F59E0B', icon: '🤝' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🍛 Food Distribution</h3>
                {food.map((fc: any) => (
                  <div key={fc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.8rem' }}>
                    <div><div style={{ fontWeight: 700 }}>{fc.name}</div><div style={{ color: '#6B7280' }}>Served: {fc.current_count}/{fc.capacity}</div></div>
                    <span className={`badge ${fc.available_now ? 'badge-green' : 'badge-red'}`}>{fc.available_now ? 'OPEN' : 'CLOSED'}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🏠 Shelter Status</h3>
                {shelters.map((s: any) => (
                  <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <span className={`badge ${s.current_occupancy < s.capacity ? 'badge-green' : 'badge-red'}`}>{s.current_occupancy < s.capacity ? 'SPACE' : 'FULL'}</span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: '0.25rem' }}>
                      <div className="progress-fill" style={{ width: `${(s.current_occupancy / s.capacity) * 100}%`, background: s.current_occupancy / s.capacity > 0.8 ? '#EF4444' : '#22C55E' }} />
                    </div>
                    <div style={{ color: '#6B7280' }}>{s.current_occupancy}/{s.capacity} occupied</div>
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
