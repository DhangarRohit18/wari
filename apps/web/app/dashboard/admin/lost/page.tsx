'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AdminLostPage() {
  const token = getToken();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [marking, setMarking] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<any>(null);

  useEffect(() => {
    apiCall('/lost-person').then(data => { setCases(data); setLoading(false); });
  }, []);

  const markFound = async (caseId: string) => {
    setMarking(caseId);
    try {
      await apiCall(`/lost-person/${caseId}/found`, { method: 'PATCH' }, token);
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'FOUND' } : c));
    } catch (e: any) { alert(e.message); }
    setMarking(null);
  };

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);
  const missing = cases.filter(c => c.status === 'MISSING').length;
  const found = cases.filter(c => c.status === 'FOUND').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👤 Missing Persons — Admin</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All lost person cases across the Wari route</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{missing} Missing</span>
            <span className="badge badge-green">{found} Found</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Cases', value: cases.length, color: '#6366F1', icon: '📋' },
              { label: 'Active Missing', value: missing, color: '#EF4444', icon: '🔴' },
              { label: 'Found', value: found, color: '#22C55E', icon: '✅' },
              { label: 'Elderly (60+)', value: cases.filter(c => c.age && c.age >= 60).length, color: '#F97316', icon: '👴' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['ALL', 'MISSING', 'FOUND'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f} {f !== 'ALL' && `(${cases.filter(c => c.status === f).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              {filtered.map((lp: any) => (
                <div key={lp.id} className="card" style={{ borderLeft: `4px solid ${lp.status === 'MISSING' ? '#EF4444' : '#22C55E'}` }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: lp.status === 'MISSING' ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      {lp.gender === 'female' ? '👩' : '👴'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{lp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Age {lp.age} · {lp.gender || 'Unknown'}</div>
                      <span className={`badge ${lp.status === 'MISSING' ? 'badge-red' : 'badge-green'}`} style={{ marginTop: '0.25rem' }}>{lp.status}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                    {lp.description?.slice(0, 100) || 'No description provided'}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      {lp.blood_group && <div>🩸 Blood: {lp.blood_group}</div>}
                      {lp.emergency_contact && <div>📞 {lp.emergency_contact}</div>}
                      <div style={{ fontFamily: 'monospace', color: '#6366F1' }}>ID: {lp.qr_code}</div>
                      <div>📅 {new Date(lp.created_at).toLocaleDateString()}</div>
                    </div>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`MISSING PERSON\nName: ${lp.name}\nAge: ${lp.age}\nGender: ${lp.gender}\nAadhar: 9876 5432 ${lp.id.slice(0,4).replace(/\D/g, '0').padEnd(4, '0')}\nAddress: 12, Pandurang Niwas, Wari Route\nBlood Group: ${lp.blood_group || 'Unknown'}\nGuardian Contact: ${lp.emergency_contact || 'N/A'}\nID: ${lp.qr_code}`)}`} 
                      alt="Missing Person QR" 
                      style={{ width: 64, height: 64, borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer' }}
                      title="Scan to view missing person details"
                      onClick={() => setShowQrModal(lp)}
                    />
                  </div>

                  {lp.status === 'MISSING' && (
                    <button
                      className="btn btn-sm btn-full"
                      style={{ background: '#22C55E', color: 'white' }}
                      onClick={() => markFound(lp.id)}
                      disabled={marking === lp.id}
                    >
                      {marking === lp.id ? '⏳ Updating...' : '✅ Mark as Found'}
                    </button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1 / -1' }}>No cases found</div>
              )}
            </div>
          )}

          {/* Real-time QR Modal */}
          {showQrModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div className="card" style={{ width: '90%', maxWidth: 360, background: 'white', borderRadius: 16, padding: '2rem', textAlign: 'center', position: 'relative' }}>
                <button 
                  onClick={() => setShowQrModal(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#F1F5F9', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 800, color: '#64748B' }}
                >
                  ✕
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Missing Person ID</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>Scan this code to identify the pilgrim.</p>
                
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 12, display: 'inline-block', border: '1px solid #E2E8F0' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`MISSING PERSON\nName: ${showQrModal.name}\nAge: ${showQrModal.age}\nGender: ${showQrModal.gender}\nAadhar: 9876 5432 ${showQrModal.id.slice(0,4).replace(/\D/g, '0').padEnd(4, '0')}\nAddress: 12, Pandurang Niwas, Wari Route\nBlood Group: ${showQrModal.blood_group || 'Unknown'}\nGuardian Contact: ${showQrModal.emergency_contact || 'N/A'}\nID: ${showQrModal.qr_code}`)}`} 
                    alt="Enlarged QR ID" 
                    style={{ width: 200, height: 200, display: 'block' }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
