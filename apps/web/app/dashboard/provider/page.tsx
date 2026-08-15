'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ProviderDashboard() {
  const token = getToken();
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { apiCall('/food').then(data => { setFood(data); setLoading(false); }); }, []);

  const toggleAvailability = async (fc: any) => {
    setUpdating(fc.id);
    try {
      await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ available_now: !fc.available_now }) }, token);
      setFood(prev => prev.map(f => f.id === fc.id ? { ...f, available_now: !f.available_now } : f));
    } catch {} finally { setUpdating(null); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🏪 Service Provider</h1>
          <span className="badge badge-blue">Manage Your Services</span>
        </header>
        <div className="dashboard-content">

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '📊', labelKey: 'Stock Levels', path: '/dashboard/provider/stock', border: '#D97706' },
                    { icon: '⚙️', labelKey: 'Settings', path: '/dashboard/provider/settings', border: '#64748B' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>

          <h3 style={{ marginBottom: '1rem' }}>🍛 Food Centres</h3>
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {food.map((fc: any) => (
                <div key={fc.id} className="card" style={{ borderTop: `3px solid ${fc.available_now ? '#22C55E' : '#9CA3AF'}` }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{fc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>Capacity: {fc.capacity} · Queue: {fc.estimated_queue_minutes} min</div>
                  <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${(fc.current_count / fc.capacity) * 100}%`, background: '#F97316' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>{fc.current_count}/{fc.capacity} served</div>
                  <button
                    className="btn btn-sm btn-full"
                    style={{ background: fc.available_now ? '#EF4444' : '#22C55E', color: 'white' }}
                    onClick={() => toggleAvailability(fc)}
                    disabled={updating === fc.id}
                  >
                    {updating === fc.id ? 'Updating...' : fc.available_now ? '✗ Mark as Closed' : '✓ Mark as Open'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
