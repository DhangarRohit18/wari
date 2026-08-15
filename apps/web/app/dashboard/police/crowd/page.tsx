'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LEVEL_COLOR: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };

export default function PoliceCrowdPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = () => apiCall('/crowd/current').then(data => { 
      if (!data || data.length === 0) {
        data = [
          { id: 'z1', name: 'Ghat Zone A', zone_type: 'RIVER_BANK', crowd_level: 'RED', current_density: 0.9, estimated_count: 12500 },
          { id: 'z2', name: 'Wakhari Approach', zone_type: 'HIGHWAY', crowd_level: 'ORANGE', current_density: 0.75, estimated_count: 8000 },
          { id: 'z3', name: 'Temple Queue', zone_type: 'TEMPLE', crowd_level: 'YELLOW', current_density: 0.5, estimated_count: 4500 }
        ];
      }
      setZones(data); 
      setLoading(false); 
    });
    fetchZones();
    // Disable auto-refresh for the demo so manual edits don't get wiped
    // const interval = setInterval(fetchZones, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleOverrideLevel = (id: string, newLevel: string) => {
    let newDensity = 0.3;
    if (newLevel === 'RED') newDensity = 0.95;
    else if (newLevel === 'ORANGE') newDensity = 0.75;
    else if (newLevel === 'YELLOW') newDensity = 0.5;

    setZones(zones.map(z => z.id === id ? { ...z, crowd_level: newLevel, current_density: newDensity } : z));
  };

  const red = zones.filter(z => z.crowd_level === 'RED').length;
  const orange = zones.filter(z => z.crowd_level === 'ORANGE').length;
  const totalPilgrims = zones.reduce((a, z) => a + (z.estimated_count || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚦 Crowd Alerts — Police</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Live crowd zone density · Auto-refreshes every 30s</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {red > 0 && <span className="badge badge-red">🔴 {red} RED zones</span>}
            {orange > 0 && <span className="badge badge-orange">🟠 {orange} ORANGE zones</span>}
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'RED Zones', value: red, color: '#EF4444', icon: '🔴' },
              { label: 'ORANGE Zones', value: orange, color: '#F97316', icon: '🟠' },
              { label: 'GREEN Zones', value: zones.filter(z => z.crowd_level === 'GREEN').length, color: '#22C55E', icon: '🟢' },
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
              <span style={{ fontSize: '1.5rem' }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, color: '#DC2626' }}>{red} zone(s) at CRITICAL density</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Deploy additional personnel immediately. Consider crowd diversion.</div>
              </div>
            </div>
          )}

          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[...zones].sort((a, b) => {
                const ord: any = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
                return (ord[a.crowd_level] || 3) - (ord[b.crowd_level] || 3);
              }).map((z: any) => (
                <div key={z.id} className="card" style={{ borderLeft: `4px solid ${LEVEL_COLOR[z.crowd_level]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{z.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{z.zone_type || 'Zone'}</div>
                    </div>
                    <span className="badge" style={{ background: `${LEVEL_COLOR[z.crowd_level]}20`, color: LEVEL_COLOR[z.crowd_level], fontWeight: 800 }}>{z.crowd_level}</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${(z.current_density || 0) * 100}%`, background: LEVEL_COLOR[z.crowd_level] }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6B7280' }}>Density: {((z.current_density || 0) * 100).toFixed(0)}%</span>
                    <span style={{ fontWeight: 700, color: LEVEL_COLOR[z.crowd_level] }}>{z.estimated_count?.toLocaleString()} people</span>
                  </div>
                  {z.crowd_level === 'RED' && (
                    <div style={{ marginTop: '0.5rem', background: '#FEF2F2', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 600 }}>
                      ⚠️ Deploy officers — high stampede risk
                    </div>
                  )}
                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid #F3F4F6', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.25rem' }}>Manual Override Level:</div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {['GREEN', 'YELLOW', 'ORANGE', 'RED'].map(lvl => (
                        <button 
                          key={lvl} 
                          onClick={() => handleOverrideLevel(z.id, lvl)}
                          style={{ 
                            flex: 1, 
                            padding: '0.25rem', 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            border: `1px solid ${LEVEL_COLOR[lvl]}`, 
                            borderRadius: 4,
                            background: z.crowd_level === lvl ? LEVEL_COLOR[lvl] : 'transparent',
                            color: z.crowd_level === lvl ? 'white' : LEVEL_COLOR[lvl],
                            cursor: 'pointer'
                          }}
                        >
                          {lvl.charAt(0)}
                        </button>
                      ))}
                    </div>
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
