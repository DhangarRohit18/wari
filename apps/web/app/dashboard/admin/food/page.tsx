'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminFoodPage() {
  const token = getToken();
  const [food, setFood] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [queueInput, setQueueInput] = useState<Record<string, string>>({});

  useEffect(() => {
    apiCall('/food').then(data => { setFood(data); setLoading(false); });
  }, []);

  const toggleAvailability = async (fc: any) => {
    setUpdating(fc.id);
    try {
      await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ available_now: !fc.available_now }) }, token);
      setFood(prev => prev.map(f => f.id === fc.id ? { ...f, available_now: !f.available_now } : f));
    } catch (e: any) { alert(e.message); }
    setUpdating(null);
  };

  const updateQueue = async (fc: any) => {
    const val = parseInt(queueInput[fc.id] || '');
    if (isNaN(val)) return;
    setUpdating(fc.id);
    try {
      await apiCall(`/food/${fc.id}`, { method: 'PATCH', body: JSON.stringify({ estimated_queue_minutes: val }) }, token);
      setFood(prev => prev.map(f => f.id === fc.id ? { ...f, estimated_queue_minutes: val } : f));
      setQueueInput(prev => ({ ...prev, [fc.id]: '' }));
    } catch (e: any) { alert(e.message); }
    setUpdating(null);
  };

  const totalCapacity = food.reduce((a, f) => a + f.capacity, 0);
  const totalServed = food.reduce((a, f) => a + f.current_count, 0);
  const openCentres = food.filter(f => f.available_now).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🍛 Food Centre Management</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Admin — Manage all Annadan centres</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-green">{openCentres}/{food.length} Open</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Open Centres', value: openCentres, color: '#22C55E', icon: '✅' },
              { label: 'Closed Centres', value: food.length - openCentres, color: '#EF4444', icon: '❌' },
              { label: 'Total Capacity', value: totalCapacity.toLocaleString(), color: '#F97316', icon: '🍛' },
              { label: 'Served Today', value: totalServed.toLocaleString(), color: '#6366F1', icon: '👥' },
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {food.map((fc: any) => (
                <div key={fc.id} className="card" style={{ borderTop: `3px solid ${fc.available_now ? '#22C55E' : '#EF4444'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{fc.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{fc.provider}</div>
                    </div>
                    <span className={`badge ${fc.available_now ? 'badge-green' : 'badge-red'}`}>
                      {fc.available_now ? '✓ OPEN' : '✗ CLOSED'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Queue</div><div style={{ fontWeight: 700, color: fc.estimated_queue_minutes > 15 ? '#EF4444' : '#22C55E' }}>{fc.estimated_queue_minutes} min</div></div>
                    <div><div style={{ color: '#6B7280' }}>Hygiene</div><div style={{ fontWeight: 700 }}>⭐ {fc.hygiene_rating}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Served</div><div style={{ fontWeight: 700 }}>{fc.current_count}/{fc.capacity}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Meals</div><div style={{ fontWeight: 700 }}>{(fc.meal_types || []).join(', ') || '—'}</div></div>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                    <div className="progress-fill" style={{ width: `${(fc.current_count / fc.capacity) * 100}%`, background: '#F97316' }} />
                  </div>

                  {/* Queue update */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="input" type="number" placeholder="Update queue (min)"
                      style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
                      value={queueInput[fc.id] || ''}
                      onChange={e => setQueueInput(prev => ({ ...prev, [fc.id]: e.target.value }))} />
                    <button className="btn btn-sm btn-secondary" onClick={() => updateQueue(fc)} disabled={updating === fc.id}>
                      Set
                    </button>
                  </div>

                  <button
                    className="btn btn-sm btn-full"
                    style={{ background: fc.available_now ? '#EF4444' : '#22C55E', color: 'white' }}
                    onClick={() => toggleAvailability(fc)}
                    disabled={updating === fc.id}
                  >
                    {updating === fc.id ? 'Updating...' : fc.available_now ? '✗ Close Centre' : '✓ Open Centre'}
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
