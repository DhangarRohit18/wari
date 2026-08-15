'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function PoliceDashboard() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [lost, setLost] = useState<any[]>([]);
  const [crowd, setCrowd] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([apiCall('/sos', {}, token), apiCall('/lost-person'), apiCall('/crowd/current')]).then(([s, l, c]) => {
      setSos(s.filter((x: any) => !['RESOLVED','CANCELLED'].includes(x.status)));
      setLost(l.filter((l: any) => l.status === 'MISSING'));
      setCrowd(c);
      setLoading(false);
    });
  }, []);
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚔 Police Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{sos.length} Active SOS</span>
            <span className="badge badge-orange">{crowd.filter(z => z.crowd_level === 'RED').length} Red Zones</span>
          </div>
        </header>
        <div className="dashboard-content">

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '🚨', labelKey: 'Crowd Control', path: '/dashboard/police/crowd', border: '#EA580C' },
                    { icon: '🆘', labelKey: 'SOS Alerts', path: '/dashboard/police/sos', border: '#EF4444' },
                    { icon: '👤', labelKey: 'Missing Persons', path: '/dashboard/police/lost', border: '#EC4899' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Active Incidents', value: sos.length, color: '#EF4444', icon: '🆘' },
              { label: 'Missing Persons', value: lost.length, color: '#EC4899', icon: '👤' },
              { label: 'Crowd Red Zones', value: crowd.filter(z => z.crowd_level === 'RED').length, color: '#EF4444', icon: '🔴' },
              { label: 'Orange Zones', value: crowd.filter(z => z.crowd_level === 'ORANGE').length, color: '#F97316', icon: '🟠' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🆘 Active SOS Incidents</h3>
                {sos.map((s: any) => (
                  <div key={s.id} className="card card-sm sos-card" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700 }}>{s.category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{s.description || 'No description'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}</div>
                    <span className="badge badge-red" style={{ marginTop: '0.25rem' }}>{s.status}</span>
                  </div>
                ))}
                {sos.length === 0 && <p style={{ color: '#9CA3AF' }}>No active incidents</p>}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>👤 Missing Persons</h3>
                {lost.map((lp: any) => (
                  <div key={lp.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontWeight: 700 }}>{lp.name}, {lp.age} yrs</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{lp.description?.slice(0, 60)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#EC4899' }}>QR: {lp.qr_code}</div>
                  </div>
                ))}
                {lost.length === 0 && <p style={{ color: '#9CA3AF' }}>No missing persons</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
