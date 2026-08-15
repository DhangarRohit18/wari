'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function NGOFoodPage() {
  const token = getToken();
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    apiCall('/food').then(data => { setFood(data); setLoading(false); });
  }, []);

  const toggle = async (fc: any) => {
    setUpdating(fc.id);
    await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ available_now: !fc.available_now }) }, token);
    setFood(prev => prev.map(f => f.id === fc.id ? { ...f, available_now: !f.available_now } : f));
    setUpdating(null);
  };

  const openCount = food.filter(f => f.available_now).length;
  const totalServed = food.reduce((a, f) => a + f.current_count, 0);
  const totalCap = food.reduce((a, f) => a + f.capacity, 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🍛 Food Distribution</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>NGO — Manage all Annadan food centres</p>
          </div>
          <span className="badge badge-green">{openCount}/{food.length} Open</span>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Open Centres', value: openCount, color: '#22C55E', icon: '✅' },
              { label: 'Closed', value: food.length - openCount, color: '#EF4444', icon: '❌' },
              { label: 'Total Served', value: totalServed.toLocaleString(), color: '#F97316', icon: '👥' },
              { label: 'Total Capacity', value: totalCap.toLocaleString(), color: '#6366F1', icon: '🍛' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {food.map((fc: any) => (
                <div key={fc.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{fc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>{fc.provider} · Queue: {fc.estimated_queue_minutes} min · Hygiene: ⭐{fc.hygiene_rating}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(fc.current_count / fc.capacity) * 100}%`, background: '#F97316' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{fc.current_count.toLocaleString()}/{fc.capacity.toLocaleString()} served</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <span className={`badge ${fc.available_now ? 'badge-green' : 'badge-red'}`}>{fc.available_now ? 'OPEN' : 'CLOSED'}</span>
                    <button className="btn btn-sm" style={{ background: fc.available_now ? '#EF4444' : '#22C55E', color: 'white', minWidth: 100 }}
                      onClick={() => toggle(fc)} disabled={updating === fc.id}>
                      {updating === fc.id ? '...' : fc.available_now ? 'Close' : 'Open'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
