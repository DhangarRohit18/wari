'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminWaterPage() {
  const [water, setWater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall('/water').then(data => { setWater(data); setLoading(false); });
  }, []);

  const statusColor: Record<string, string> = {
    AVAILABLE: '#22C55E', LOW: '#F59E0B', EMPTY: '#EF4444', MAINTENANCE: '#9CA3AF',
  };

  const filtered = filter === 'ALL' ? water : water.filter(w => w.status === filter);
  const available = water.filter(w => w.status === 'AVAILABLE').length;
  const low = water.filter(w => w.status === 'LOW').length;
  const empty = water.filter(w => w.status === 'EMPTY').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>💧 Water Points — Admin</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All water distribution points across the Wari route</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {empty > 0 && <span className="badge badge-red">🔴 {empty} Empty</span>}
            {low > 0 && <span className="badge badge-yellow">🟡 {low} Low</span>}
            <span className="badge badge-green">{available} Available</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available', value: available, color: '#22C55E', icon: '💧' },
              { label: 'Low Supply', value: low, color: '#F59E0B', icon: '⚠️' },
              { label: 'Empty', value: empty, color: '#EF4444', icon: '🔴' },
              { label: 'Shortage Risk', value: empty > 0 ? 'HIGH' : low > 3 ? 'MED' : 'LOW', color: empty > 0 ? '#EF4444' : low > 3 ? '#F59E0B' : '#22C55E', icon: '📊' },
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
            {['ALL', 'AVAILABLE', 'LOW', 'EMPTY', 'MAINTENANCE'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}>
                {f} {f !== 'ALL' && `(${water.filter(w => w.status === f).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => {
                const ord = { EMPTY: 0, LOW: 1, AVAILABLE: 2, MAINTENANCE: 3 };
                return (ord[a.status as keyof typeof ord] || 2) - (ord[b.status as keyof typeof ord] || 2);
              }).map((wp: any) => (
                <div key={wp.id} className="card" style={{ borderLeft: `4px solid ${statusColor[wp.status] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{wp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{wp.water_type || 'Drinking Water'}</div>
                    </div>
                    <span className="badge" style={{ background: `${statusColor[wp.status]}20`, color: statusColor[wp.status] }}>{wp.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#6B7280' }}>
                    <div>📍 {wp.latitude?.toFixed(3)}, {wp.longitude?.toFixed(3)}</div>
                    <div>{wp.is_filtered ? '🔬 Filtered' : '💧 Regular'}</div>
                    <div>{wp.has_cooling ? '❄️ Cold Water' : '🌡️ Normal temp'}</div>
                    <div>⭐ Rating: {wp.rating || '—'}</div>
                  </div>
                  {wp.status === 'EMPTY' && (
                    <div style={{ marginTop: '0.75rem', background: '#FEE2E2', borderRadius: 8, padding: '0.5rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>
                      🔴 Needs immediate refill!
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No water points found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
