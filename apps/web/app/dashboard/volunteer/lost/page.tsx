'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function VolunteerLostPage() {
  const token = getToken();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);
  const [filter, setFilter] = useState('MISSING');
  const [qrSearch, setQrSearch] = useState('');

  useEffect(() => { apiCall('/lost-person').then(d => { setCases(d); setLoading(false); }); }, []);

  const markFound = async (id: string) => {
    setMarking(id);
    try {
      await apiCall(`/lost-person/${id}/found`, { method: 'PATCH' }, token);
      setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'FOUND' } : c));
    } catch (e: any) { alert(e.message); }
    setMarking(null);
  };

  const missing = cases.filter(c => c.status === 'MISSING').length;
  let filtered = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);
  if (qrSearch.trim()) filtered = filtered.filter(c => c.qr_code?.toLowerCase().includes(qrSearch.toLowerCase()));

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👤 Lost Persons</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Volunteer — Help reunite missing pilgrims</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{missing} Missing</span>
            <span className="badge badge-green">{cases.filter(c => c.status === 'FOUND').length} Found</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="input" placeholder="📱 Search by QR code..." style={{ flex: 1, minWidth: 200 }}
              value={qrSearch} onChange={e => setQrSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['MISSING', 'FOUND', 'ALL'].map(f => (
                <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                  {f} ({f === 'MISSING' ? missing : f === 'FOUND' ? cases.filter(c => c.status === 'FOUND').length : cases.length})
                </button>
              ))}
            </div>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filtered.map((lp: any) => (
                <div key={lp.id} className="card" style={{ borderLeft: `4px solid ${lp.status === 'MISSING' ? '#EF4444' : '#22C55E'}` }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: lp.status === 'MISSING' ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      {lp.gender === 'female' ? '👩' : lp.age < 18 ? '👶' : '👴'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{lp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Age {lp.age} · {lp.gender}</div>
                      <span className={`badge ${lp.status === 'MISSING' ? 'badge-red' : 'badge-green'}`} style={{ marginTop: '0.25rem' }}>{lp.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {lp.description?.slice(0, 100) || 'No description'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    {lp.blood_group && <div>🩸 {lp.blood_group}</div>}
                    {lp.emergency_contact && <div>📞 {lp.emergency_contact}</div>}
                    <div style={{ fontFamily: 'monospace', color: '#6366F1', fontWeight: 700, gridColumn: '1/-1' }}>📱 {lp.qr_code}</div>
                  </div>
                  {lp.status === 'MISSING' && (
                    <button className="btn btn-sm btn-full" style={{ background: '#22C55E', color: 'white' }}
                      onClick={() => markFound(lp.id)} disabled={marking === lp.id}>
                      {marking === lp.id ? '⏳...' : '✅ Found This Person'}
                    </button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No cases found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
