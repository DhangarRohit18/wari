'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function NGOWaterPage() {
  const [water, setWater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { apiCall('/water').then(d => { setWater(d); setLoading(false); }); }, []);

  const statusColor: Record<string, string> = { AVAILABLE: '#22C55E', LOW: '#F59E0B', EMPTY: '#EF4444', MAINTENANCE: '#9CA3AF' };
  const filtered = filter === 'ALL' ? water : water.filter(w => w.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>💧 Water Distribution</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>NGO — All water points on the route</p>
          </div>
          <span className="badge badge-blue">{water.filter(w => w.status === 'AVAILABLE').length}/{water.length} Active</span>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available', value: water.filter(w => w.status === 'AVAILABLE').length, color: '#22C55E', icon: '💧' },
              { label: 'Low Supply', value: water.filter(w => w.status === 'LOW').length, color: '#F59E0B', icon: '⚠️' },
              { label: 'Empty', value: water.filter(w => w.status === 'EMPTY').length, color: '#EF4444', icon: '🔴' },
              { label: 'Filtered Water', value: water.filter(w => w.is_filtered).length, color: '#3B82F6', icon: '🔬' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['ALL', 'AVAILABLE', 'LOW', 'EMPTY'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f} {f !== 'ALL' && `(${water.filter(w => w.status === f).length})`}
              </button>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => { const o: any = { EMPTY: 0, LOW: 1, AVAILABLE: 2, MAINTENANCE: 3 }; return o[a.status] - o[b.status]; })
                .map((wp: any) => (
                  <div key={wp.id} className="card" style={{ borderLeft: `4px solid ${statusColor[wp.status]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div><div style={{ fontWeight: 700 }}>{wp.name}</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{wp.water_type || 'Drinking Water'}</div></div>
                      <span className="badge" style={{ background: `${statusColor[wp.status]}20`, color: statusColor[wp.status] }}>{wp.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.8rem', color: '#6B7280' }}>
                      <div>{wp.is_filtered ? '🔬 Filtered' : '💧 Regular'}</div>
                      <div>{wp.has_cooling ? '❄️ Cold' : '🌡️ Normal'}</div>
                    </div>
                    {wp.status === 'EMPTY' && (
                      <div style={{ marginTop: '0.5rem', background: '#FEE2E2', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>
                        🔴 Needs immediate refill — contact NGO dispatch
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
