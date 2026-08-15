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

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState(500);
  const [newOpen, setNewOpen] = useState('08:00');
  const [newClose, setNewClose] = useState('20:00');

  useEffect(() => { 
    apiCall('/food').then(d => { 
      if (!d || d.length === 0) {
        d = [{ id: 'f1', name: 'Ghat Mahaprasad', provider: 'Wari Seva Mandal', available_now: true, current_count: 150, capacity: 500, estimated_queue_minutes: 10, hygiene_rating: 4.8, opening_time: '08:00', closing_time: '20:00' }];
      }
      setFood(d); 
      setLoading(false); 
    }); 
  }, []);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    const newFc = {
      id: `f${Date.now()}`,
      name: newName,
      provider: 'Current Provider',
      available_now: false,
      current_count: 0,
      capacity: newCapacity,
      estimated_queue_minutes: 0,
      hygiene_rating: 5.0,
      opening_time: newOpen,
      closing_time: newClose,
    };
    setFood([newFc, ...food]);
    setShowAddModal(false);
    setNewName('');
  };

  const handleDeleteFood = (id: string) => {
    if (confirm("Remove this food centre?")) setFood(food.filter(f => f.id !== id));
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge badge-green">{food.filter(f => f.available_now).length}/{food.length} Open</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Register Centre</button>
          </div>
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" style={{ flex: 1, background: fc.available_now ? '#EF4444' : '#22C55E', color: 'white' }}
                      onClick={() => toggle(fc)} disabled={updating === fc.id}>
                      {updating === fc.id ? '...' : fc.available_now ? '✗ Close Serving' : '✓ Start Serving'}
                    </button>
                    <button onClick={() => handleDeleteFood(fc.id)} style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 6, color: '#EF4444', cursor: 'pointer', padding: '0.25rem 0.75rem' }} title="Remove Centre">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {food.length === 0 && <p style={{ color: '#9CA3AF', gridColumn: '1/-1', textAlign: 'center' }}>No food centres registered.</p>}
            </div>
          )}
        </div>

        {/* Add Food Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Register Food Centre</h2>
              <form onSubmit={handleAddFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Centre Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Mahaprasad Tent 1" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Capacity / Meals</label>
                  <input type="number" value={newCapacity} onChange={e => setNewCapacity(Number(e.target.value))} required min={10} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Opening Time</label>
                    <input type="time" value={newOpen} onChange={e => setNewOpen(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Closing Time</label>
                    <input type="time" value={newClose} onChange={e => setNewClose(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
