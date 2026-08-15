'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const CAT_COLOR: Record<string, string> = {
  MEDICAL: '#EF4444', DEHYDRATION: '#3B82F6', FATIGUE: '#F59E0B',
  ACCIDENT: '#8B5CF6', LOST: '#EC4899', WOMEN_SAFETY: '#F97316', OTHER: '#9CA3AF',
};

const STATUS_COLOR: Record<string, string> = {
  CREATED: '#EF4444', ACKNOWLEDGED: '#F97316', IN_PROGRESS: '#F59E0B',
  RESOLVED: '#22C55E', CANCELLED: '#9CA3AF', MEDICAL_ASSIGNED: '#8B5CF6',
};

export default function PoliceSosPage() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    apiCall('/sos', {}, token).then(data => { setSos(data); setLoading(false); });
  }, []);

  const active = sos.filter(s => !['RESOLVED', 'CANCELLED'].includes(s.status));
  const resolved = sos.filter(s => s.status === 'RESOLVED');
  const displayed = filter === 'ACTIVE' ? active : filter === 'RESOLVED' ? resolved : sos;

  const acknowledge = async (id: string) => {
    await apiCall(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ACKNOWLEDGED' }) }, token);
    setSos(prev => prev.map(s => s.id === id ? { ...s, status: 'ACKNOWLEDGED' } : s));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🆘 SOS Incidents — Police</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All emergency SOS reports in your jurisdiction</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{sos.filter(s => s.status === 'CREATED').length} New</span>
            <span className="badge badge-green">{resolved.length} Resolved</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Active Incidents', value: active.length, color: '#EF4444', icon: '🆘' },
              { label: 'Acknowledged', value: sos.filter(s => s.status === 'ACKNOWLEDGED').length, color: '#F97316', icon: '👀' },
              { label: 'Resolved Today', value: resolved.length, color: '#22C55E', icon: '✅' },
              { label: 'Women Safety', value: sos.filter(s => s.category === 'WOMEN_SAFETY').length, color: '#EC4899', icon: '👩' },
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
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayed.map((s: any) => (
                <div key={s.id} className="card" style={{ borderLeft: `4px solid ${CAT_COLOR[s.category] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: CAT_COLOR[s.category] }}>{s.category}</span>
                        <span className="badge" style={{ background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status], fontSize: '0.65rem' }}>{s.status}</span>
                        {s.is_offline && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>📡 Offline</span>}
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>{new Date(s.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>{s.description || 'Emergency assistance requested'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)} · ID: {s.id.slice(0, 8)}
                      </div>
                    </div>
                    {s.status === 'CREATED' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => acknowledge(s.id)} style={{ marginLeft: '1rem', flexShrink: 0 }}>
                        👀 Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p>No incidents in this category</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
