'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function MedicalDashboard() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [sosData, campsData] = await Promise.all([
        apiCall('/sos', {}, token),
        apiCall('/medical'),
      ]);
      setSos(sosData.filter((s: any) => s.category === 'MEDICAL' || !['RESOLVED','CANCELLED'].includes(s.status)));
      setCamps(campsData);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const acceptCase = async (sosId: string) => {
    try {
      await apiCall(`/sos/${sosId}/assign`, { method: 'POST' }, token);
      setSos(prev => prev.map(s => s.id === sosId ? { ...s, status: 'MEDICAL_ASSIGNED' } : s));
    } catch (e: any) { alert(e.message); }
  };

  const resolveCase = async (sosId: string) => {
    try {
      await apiCall(`/sos/${sosId}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESOLVED' }) }, token);
      setSos(prev => prev.map(s => s.id === sosId ? { ...s, status: 'RESOLVED' } : s));
    } catch {}
  };

  const catColor: Record<string, string> = { MEDICAL: '#EF4444', DEHYDRATION: '#3B82F6', FATIGUE: '#F59E0B', ACCIDENT: '#8B5CF6', LOST: '#EC4899', OTHER: '#9CA3AF' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🏥 Medical Team Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{sos.filter(s => s.status === 'CREATED').length} New</span>
            <span className="badge badge-yellow">{sos.filter(s => s.status === 'MEDICAL_ASSIGNED' || s.status === 'IN_PROGRESS').length} Active</span>
          </div>
        </header>
        <div className="dashboard-content">

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '🚑', labelKey: 'Active Cases', path: '/dashboard/medical/cases', border: '#DC2626' },
                    { icon: '📦', labelKey: 'Inventory', path: '/dashboard/medical/inventory', border: '#2563EB' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>

          <div className="stats-grid">
            {[
              { label: 'Emergency Queue', value: sos.filter(s => s.status === 'CREATED').length, color: '#EF4444', icon: '🆘' },
              { label: 'Assigned', value: sos.filter(s => s.status === 'MEDICAL_ASSIGNED').length, color: '#F59E0B', icon: '📋' },
              { label: 'Resolved Today', value: sos.filter(s => s.status === 'RESOLVED').length, color: '#22C55E', icon: '✅' },
              { label: 'Medical Camps', value: camps.filter(c => c.available).length, color: '#8B5CF6', icon: '⛺' },
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
            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🚨 Emergency Queue</h3>
                {sos.filter(s => !['RESOLVED','CANCELLED'].includes(s.status)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>✅ No active emergencies</div>
                ) : (
                  sos.filter(s => !['RESOLVED','CANCELLED'].includes(s.status)).map((s: any) => (
                    <div key={s.id} className="card card-sm" style={{ marginBottom: '0.75rem', borderLeft: `4px solid ${catColor[s.category] || '#9CA3AF'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: catColor[s.category] }}>{s.category}</div>
                          <div style={{ fontSize: '0.8rem' }}>{s.description || 'Medical assistance needed'}</div>
                          {s.blood_group && <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Blood Group: {s.blood_group}</div>}
                          <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)} · {new Date(s.created_at).toLocaleTimeString()}</div>
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: `${catColor[s.category] || '#9CA3AF'}20`, color: catColor[s.category] || '#9CA3AF' }}>{s.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {s.status === 'CREATED' && <button className="btn btn-danger btn-sm" onClick={() => acceptCase(s.id)}>Accept Case</button>}
                        {['MEDICAL_ASSIGNED', 'IN_PROGRESS'].includes(s.status) && (
                          <button className="btn btn-sm" style={{ background: '#22C55E', color: 'white' }} onClick={() => resolveCase(s.id)}>Mark Resolved</button>
                        )}
                        <a href="/dashboard/medical/queue" className="btn btn-secondary btn-sm">📋 Full Queue</a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>⛺ Medical Camps</h3>
                  {camps.slice(0, 6).map((camp: any) => (
                    <div key={camp.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{camp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Type: {camp.location_type} · Cap: {camp.capacity}</div>
                      <span className={`badge ${camp.available ? 'badge-green' : 'badge-red'}`} style={{ marginTop: '0.25rem' }}>
                        {camp.available ? '✓ Available' : '✗ Full'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
