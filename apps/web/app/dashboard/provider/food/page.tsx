'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ProviderFoodPage() {
  const token = getToken();
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [queueInputs, setQueueInputs] = useState<Record<string, string>>({});

  useEffect(() => { apiCall('/food').then(d => { setFood(d); setLoading(false); }); }, []);

  const toggle = async (fc: any) => {
    setUpdating(fc.id);
    await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ available_now: !fc.available_now }) }, token);
    setFood(prev => prev.map(f => f.id === fc.id ? { ...f, available_now: !f.available_now } : f));
    setUpdating(null);
  };

  const updateQueue = async (fc: any) => {
    const val = parseInt(queueInputs[fc.id] || '');
    if (isNaN(val) || val < 0) return;
    setUpdating(fc.id);
    await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ estimated_queue_minutes: val }) }, token);
    setFood(prev => prev.map(f => f.id === fc.id ? { ...f, estimated_queue_minutes: val } : f));
    setQueueInputs(prev => ({ ...prev, [fc.id]: '' }));
    setUpdating(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🍛 My Food Centre</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Service Provider — Manage your Annadan seva</p>
          </div>
          <span className="badge badge-green">{food.filter(f => f.available_now).length}/{food.length} Open</span>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {food.map((fc: any) => (
                <div key={fc.id} className="card" style={{ borderTop: `3px solid ${fc.available_now ? '#22C55E' : '#EF4444'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{fc.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{fc.provider}</div>
                    </div>
                    <span className={`badge ${fc.available_now ? 'badge-green' : 'badge-red'}`}>{fc.available_now ? '✓ OPEN' : '✗ CLOSED'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Served</div><div style={{ fontWeight: 700 }}>{fc.current_count}/{fc.capacity}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Queue</div><div style={{ fontWeight: 700, color: fc.estimated_queue_minutes > 15 ? '#EF4444' : '#22C55E' }}>{fc.estimated_queue_minutes} min</div></div>
                    <div><div style={{ color: '#6B7280' }}>Hygiene</div><div style={{ fontWeight: 700 }}>⭐ {fc.hygiene_rating}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Hours</div><div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{fc.opening_time}–{fc.closing_time}</div></div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                    <div className="progress-fill" style={{ width: `${(fc.current_count / fc.capacity) * 100}%`, background: '#F97316' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="input" type="number" placeholder="Update queue time (min)"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
                      value={queueInputs[fc.id] || ''}
                      onChange={e => setQueueInputs(p => ({ ...p, [fc.id]: e.target.value }))} />
                    <button className="btn btn-secondary btn-sm" onClick={() => updateQueue(fc)} disabled={updating === fc.id}>Set</button>
                  </div>
                  <button className="btn btn-sm btn-full" style={{ background: fc.available_now ? '#EF4444' : '#22C55E', color: 'white' }}
                    onClick={() => toggle(fc)} disabled={updating === fc.id}>
                    {updating === fc.id ? '...' : fc.available_now ? '✗ Close Serving' : '✓ Start Serving'}
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
