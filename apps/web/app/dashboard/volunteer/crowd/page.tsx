'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LEVEL_COLOR: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };

export default function VolunteerCrowdPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = () => apiCall('/crowd/current').then(d => { setZones(d); setLoading(false); });
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'ALL' ? zones : zones.filter(z => z.crowd_level === filter);
  const red = zones.filter(z => z.crowd_level === 'RED').length;
  const orange = zones.filter(z => z.crowd_level === 'ORANGE').length;
  const totalPilgrims = zones.reduce((a, z) => a + (z.estimated_count || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📊 Crowd Reports</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Volunteer — Live crowd zone density · Refreshes every 30s</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {red > 0 && <span className="badge badge-red">🔴 {red} Critical</span>}
            {orange > 0 && <span className="badge badge-orange">🟠 {orange} Orange</span>}
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'RED Zones', value: red, color: '#EF4444', icon: '🔴' },
              { label: 'ORANGE Zones', value: orange, color: '#F97316', icon: '🟠' },
              { label: 'Safe Zones', value: zones.filter(z => ['GREEN', 'YELLOW'].includes(z.crowd_level)).length, color: '#22C55E', icon: '🟢' },
              { label: 'Est. Pilgrims', value: totalPilgrims.toLocaleString(), color: '#6366F1', icon: '🙏' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {red > 0 && (
            <div style={{ background: '#FEE2E2', border: '2px solid #EF4444', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: '#DC2626' }}>HIGH DENSITY ALERT — {red} zone(s) at CRITICAL level</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Direct pilgrims away from these areas. Contact police if needed.</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}
                style={{ color: filter === f ? LEVEL_COLOR[f] || undefined : undefined, borderColor: filter === f ? LEVEL_COLOR[f] || undefined : undefined }}>
                {f} {f !== 'ALL' && `(${zones.filter(z => z.crowd_level === f).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => {
                const ord: any = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
                return (ord[a.crowd_level] ?? 3) - (ord[b.crowd_level] ?? 3);
              }).map((z: any) => (
                <div key={z.id} className="card" style={{ borderLeft: `4px solid ${LEVEL_COLOR[z.crowd_level]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{z.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{z.zone_type || 'Pilgrim Zone'}</div>
                    </div>
                    <span className="badge" style={{ background: `${LEVEL_COLOR[z.crowd_level]}20`, color: LEVEL_COLOR[z.crowd_level], fontWeight: 800 }}>
                      {z.crowd_level}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${(z.current_density || 0) * 100}%`, background: LEVEL_COLOR[z.crowd_level] }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6B7280' }}>Density: {((z.current_density || 0) * 100).toFixed(0)}%</span>
                    <span style={{ fontWeight: 700, color: LEVEL_COLOR[z.crowd_level] }}>
                      ~{z.estimated_count?.toLocaleString()} people
                    </span>
                  </div>
                  {z.crowd_level === 'RED' && (
                    <div style={{ marginTop: '0.5rem', background: '#FEF2F2', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                      🚨 Redirect pilgrims — avoid this area
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No zones in this category</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
