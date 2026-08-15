'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminSOSPage() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall('/sos', {}, token).then(data => { setSos(data); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiCall(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
    setSos(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const filtered = filter === 'ALL' ? sos : sos.filter(s => s.status === filter);
  const statusColor: Record<string, string> = { CREATED: '#EF4444', ACKNOWLEDGED: '#F59E0B', VOLUNTEER_ASSIGNED: '#3B82F6', MEDICAL_ASSIGNED: '#8B5CF6', IN_PROGRESS: '#F97316', RESOLVED: '#22C55E', CANCELLED: '#9CA3AF' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🆘 SOS Feed</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'CREATED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f === 'ALL' ? 'All' : f.replace('_', ' ')} {f !== 'ALL' && `(${sos.filter(s => s.status === f).length})`}
              </button>
            ))}
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((s: any) => (
                <div key={s.id} className="card" style={{ borderLeft: `4px solid ${statusColor[s.status]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: statusColor[s.status], fontSize: '1rem' }}>{s.category}</span>
                        <span className="badge" style={{ background: `${statusColor[s.status]}20`, color: statusColor[s.status] }}>{s.status}</span>
                        {s.is_offline && <span className="badge badge-yellow">📡 Offline</span>}
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>
                          {new Date(s.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>{s.description || 'No description provided'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                        {s.blood_group && ` · 🩸 ${s.blood_group}`}
                        {s.responder_name && ` · Responder: ${s.responder_name}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {s.status === 'CREATED' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(s.id, 'ACKNOWLEDGED')}>Acknowledge</button>}
                    {['ACKNOWLEDGED', 'VOLUNTEER_ASSIGNED'].includes(s.status) && <button className="btn btn-sm" style={{ background: '#8B5CF6', color: 'white' }} onClick={() => updateStatus(s.id, 'IN_PROGRESS')}>In Progress</button>}
                    {!['RESOLVED', 'CANCELLED'].includes(s.status) && <button className="btn btn-sm" style={{ background: '#22C55E', color: 'white' }} onClick={() => updateStatus(s.id, 'RESOLVED')}>Mark Resolved</button>}
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF', alignSelf: 'center' }}>ID: {s.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No SOS incidents found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
