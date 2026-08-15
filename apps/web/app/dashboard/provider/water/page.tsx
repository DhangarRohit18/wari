'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ProviderWaterPage() {
  const [water, setWater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFiltered, setNewFiltered] = useState(true);
  const [newCold, setNewCold] = useState(true);

  useEffect(() => { 
    apiCall('/water').then(d => { 
      if (!d || d.length === 0) {
        d = [{ id: 'w1', name: 'Main Gate Water', water_type: 'Drinking Water', status: 'AVAILABLE', is_filtered: true, has_cooling: true }];
      }
      setWater(d); 
      setLoading(false); 
    }); 
  }, []);

  const handleAddWater = (e: React.FormEvent) => {
    e.preventDefault();
    const newWp = {
      id: `w${Date.now()}`,
      name: newName,
      water_type: 'Drinking Water',
      status: 'AVAILABLE',
      is_filtered: newFiltered,
      has_cooling: newCold
    };
    setWater([newWp, ...water]);
    setShowAddModal(false);
    setNewName('');
  };

  const handleDeleteWater = (id: string) => {
    if (confirm("Remove this water point?")) setWater(water.filter(w => w.id !== id));
  };

  const handleRefill = (id: string) => {
    setWater(water.map(w => {
      if (w.id === id) {
        if (w.status === 'AVAILABLE') return { ...w, status: 'LOW' };
        if (w.status === 'LOW') return { ...w, status: 'EMPTY' };
        return { ...w, status: 'AVAILABLE' };
      }
      return w;
    }));
  };

  const statusColor: Record<string, string> = { AVAILABLE: '#22C55E', LOW: '#F59E0B', EMPTY: '#EF4444', MAINTENANCE: '#9CA3AF' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>💧 My Water Points</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Service Provider — Water distribution management</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge badge-blue">{water.filter(w => w.status === 'AVAILABLE').length}/{water.length} Active</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Register Point</button>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available', value: water.filter(w => w.status === 'AVAILABLE').length, color: '#22C55E', icon: '💧' },
              { label: 'Low Supply', value: water.filter(w => w.status === 'LOW').length, color: '#F59E0B', icon: '⚠️' },
              { label: 'Empty', value: water.filter(w => w.status === 'EMPTY').length, color: '#EF4444', icon: '🔴' },
              { label: 'Total Points', value: water.length, color: '#6366F1', icon: '📍' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {water.map((wp: any) => (
                <div key={wp.id} className="card" style={{ borderTop: `3px solid ${statusColor[wp.status]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div><div style={{ fontWeight: 700 }}>{wp.name}</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{wp.water_type || 'Drinking Water'}</div></div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge" style={{ background: `${statusColor[wp.status]}20`, color: statusColor[wp.status] }}>{wp.status}</span>
                      <button onClick={() => handleDeleteWater(wp.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.1rem' }} title="Remove Point">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    <div>{wp.is_filtered ? '🔬 Filtered' : '💧 Regular'}</div>
                    <div>{wp.has_cooling ? '❄️ Cold water' : '🌡️ Normal'}</div>
                  </div>
                  {wp.status !== 'AVAILABLE' && (
                    <div style={{ marginBottom: '0.75rem', background: `${statusColor[wp.status]}15`, borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: statusColor[wp.status], fontWeight: 600 }}>
                      {wp.status === 'EMPTY' ? '🔴 Needs immediate refill!' : wp.status === 'LOW' ? '⚠️ Refill soon' : '🔧 Under maintenance'}
                    </div>
                  )}
                  <button className="btn btn-sm btn-full" style={{ background: wp.status === 'AVAILABLE' ? '#F59E0B' : '#22C55E', color: 'white' }}
                    onClick={() => handleRefill(wp.id)}>
                    {wp.status === 'AVAILABLE' ? 'Mark as LOW' : wp.status === 'LOW' ? 'Mark as EMPTY' : 'Refill Complete'}
                  </button>
                </div>
              ))}
              {water.length === 0 && <p style={{ color: '#9CA3AF', gridColumn: '1/-1', textAlign: 'center' }}>No water points registered.</p>}
            </div>
          )}
        </div>

        {/* Add Water Point Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Register Water Point</h2>
              <form onSubmit={handleAddWater} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Location Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Tukaram Bhavan Water" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={newFiltered} onChange={e => setNewFiltered(e.target.checked)} />
                    🔬 Is Filtered (RO)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={newCold} onChange={e => setNewCold(e.target.checked)} />
                    ❄️ Has Cooling
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register Point</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
