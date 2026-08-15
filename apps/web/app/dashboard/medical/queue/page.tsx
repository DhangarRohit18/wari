'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const CAT_COLOR: Record<string, string> = {
  MEDICAL: '#EF4444', DEHYDRATION: '#3B82F6', FATIGUE: '#F59E0B',
  ACCIDENT: '#8B5CF6', LOST: '#EC4899', WOMEN_SAFETY: '#F97316', OTHER: '#9CA3AF',
};

export default function MedicalQueuePage() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    apiCall('/sos', {}, token).then(data => { setSos(data); setLoading(false); });
  }, []);

  const accept = async (id: string) => {
    try {
      await apiCall(`/sos/${id}/assign`, { method: 'POST' }, token);
      setSos(prev => prev.map(s => s.id === id ? { ...s, status: 'MEDICAL_ASSIGNED' } : s));
    } catch (e: any) { alert(e.message); }
  };

  const setInProgress = async (id: string) => {
    await apiCall(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'IN_PROGRESS' }) }, token);
    setSos(prev => prev.map(s => s.id === id ? { ...s, status: 'IN_PROGRESS' } : s));
  };

  const resolve = async (id: string) => {
    await apiCall(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESOLVED' }) }, token);
    setSos(prev => prev.map(s => s.id === id ? { ...s, status: 'RESOLVED' } : s));
  };

  const active = sos.filter(s => !['RESOLVED', 'CANCELLED'].includes(s.status));
  const resolved = sos.filter(s => s.status === 'RESOLVED');
  const displayed = filter === 'ACTIVE' ? active : filter === 'RESOLVED' ? resolved : sos;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚨 Emergency Queue</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Medical team — all emergency cases</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{sos.filter(s => s.status === 'CREATED').length} New</span>
            <span className="badge badge-yellow">{sos.filter(s => s.status === 'MEDICAL_ASSIGNED' || s.status === 'IN_PROGRESS').length} Active</span>
            <span className="badge badge-green">{resolved.length} Resolved</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'New Cases', value: sos.filter(s => s.status === 'CREATED').length, color: '#EF4444', icon: '🆘' },
              { label: 'In Progress', value: sos.filter(s => ['MEDICAL_ASSIGNED', 'IN_PROGRESS'].includes(s.status)).length, color: '#F59E0B', icon: '🏃' },
              { label: 'Resolved', value: resolved.length, color: '#22C55E', icon: '✅' },
              { label: 'Blood Req.', value: sos.filter(s => s.blood_group && !['RESOLVED','CANCELLED'].includes(s.status)).length, color: '#8B5CF6', icon: '🩸' },
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
            {['ACTIVE', 'RESOLVED', 'ALL'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f} ({f === 'ACTIVE' ? active.length : f === 'RESOLVED' ? resolved.length : sos.length})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayed.map((s: any) => (
                <div key={s.id} className="card" style={{ borderLeft: `4px solid ${CAT_COLOR[s.category] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: CAT_COLOR[s.category] }}>{s.category}</span>
                        <span className="badge" style={{ background: `${CAT_COLOR[s.category]}20`, color: CAT_COLOR[s.category], fontSize: '0.65rem' }}>{s.status}</span>
                        {s.is_offline && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>📡 Offline</span>}
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>{new Date(s.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>{s.description || 'Medical assistance needed'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                        {s.blood_group && ` · 🩸 ${s.blood_group}`}
                        {s.responder_name && ` · Responder: ${s.responder_name}`}
                      </div>
                    </div>
                  </div>
                  {!['RESOLVED', 'CANCELLED'].includes(s.status) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {s.status === 'CREATED' && <button className="btn btn-danger btn-sm" onClick={() => accept(s.id)}>✓ Accept Case</button>}
                      {s.status === 'MEDICAL_ASSIGNED' && <button className="btn btn-sm" style={{ background: '#F97316', color: 'white' }} onClick={() => setInProgress(s.id)}>▶ In Progress</button>}
                      {['MEDICAL_ASSIGNED', 'IN_PROGRESS'].includes(s.status) && (
                        <button className="btn btn-sm" style={{ background: '#22C55E', color: 'white' }} onClick={() => resolve(s.id)}>✅ Resolve</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p>No cases in this category</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
