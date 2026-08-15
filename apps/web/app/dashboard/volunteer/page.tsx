'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function VolunteerDashboard() {
  const token = getToken();
  const router = useRouter();
  const [sos, setSos] = useState<any[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [lost, setLost] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const [sosData, needsData, lostData, postsData] = await Promise.all([
        apiCall('/sos', {}, token),
        apiCall(`/help/needs?lat=${LAT}&lon=${LON}`),
        apiCall('/lost-person'),
        apiCall(`/community/posts?lat=${LAT}&lon=${LON}&radius_km=10`),
      ]);
      setSos(sosData.filter((s: any) => ['CREATED', 'ACKNOWLEDGED'].includes(s.status)));
      setNeeds(needsData);
      setLost(lostData.filter((l: any) => l.status === 'MISSING'));
      setPosts(postsData.slice(0, 6));
      setLoading(false);
    };
    fetchAll();
  }, []);

  const assignSOS = async (sosId: string) => {
    try {
      await apiCall(`/sos/${sosId}/assign`, { method: 'POST' }, token);
      setSos(prev => prev.filter(s => s.id !== sosId));
    } catch (e: any) { alert(e.message); }
  };

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    setStatusError('');
    try {
      await apiCall('/volunteers/status', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token);
    } catch {
      setStatusError('Failed to update status — please try again');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🤝 Volunteer Dashboard</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Respond to nearby emergencies and help requests</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status:</span>
            {['AVAILABLE', 'BUSY', 'OFFLINE'].map(s => (
              <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updateStatus(s)}
                style={{ borderColor: status === s ? (s === 'AVAILABLE' ? '#22C55E' : s === 'BUSY' ? '#F59E0B' : '#6B7280') : undefined }}>
                <div className={`status-dot ${s === 'AVAILABLE' ? 'status-online' : s === 'BUSY' ? 'status-busy' : 'status-offline'}`} />
                {s}
              </button>
            ))}
          </div>
        </header>

        <div className="dashboard-content">
          {statusError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#DC2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              ⚠️ {statusError}
              <button onClick={() => setStatusError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
          )}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Active SOS', value: sos.length, icon: '🆘', color: '#EF4444' },
              { label: 'Help Requests', value: needs.length, icon: '🤝', color: '#F97316' },
              { label: 'Missing Persons', value: lost.length, icon: '👤', color: '#EC4899' },
              { label: 'Community Posts', value: posts.length, icon: '📢', color: '#22C55E' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile-Only Navigation Grid */}
          <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
            <div className="mobile-only grid">
              {[
                { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                { icon: '🆘', labelKey: 'SOS Alerts', path: '/dashboard/volunteer/sos', border: '#EF4444' },
                { icon: '🤝', labelKey: 'Help Requests', path: '/dashboard/volunteer/help', border: '#F97316' },
                { icon: '👤', labelKey: 'Missing Persons', path: '/dashboard/volunteer/lost', border: '#EC4899' },
              ].map(({ icon, labelKey, path, border }) => (
                <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                  <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                  <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                </a>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Active SOS */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>🆘 Nearby SOS</h3>
                {sos.length === 0 ? <p style={{ color: '#9CA3AF' }}>No active SOS nearby</p> : sos.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="card card-sm sos-card" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.category}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{s.description?.slice(0, 60) || 'No description'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                          {s.is_offline && ' · 📡 Offline SOS'}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => assignSOS(s.id)}>✓ Accept</button>
                      <span className="badge badge-red">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Help Requests */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#F97316' }}>🤝 Help Requests</h3>
                {needs.length === 0 ? <p style={{ color: '#9CA3AF' }}>No help requests nearby</p> : needs.slice(0, 5).map((n: any) => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.category}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{n.description || 'Help needed'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>📍 {n.distance_m}m · Urgency: {n.urgency}/10</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => router.push('/dashboard/volunteer/help')}>Help</button>
                  </div>
                ))}
              </div>

              {/* Missing Persons */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#EC4899' }}>👤 Missing Persons</h3>
                {lost.length === 0 ? <p style={{ color: '#9CA3AF' }}>No missing persons reported</p> : lost.slice(0, 4).map((lp: any) => (
                  <div key={lp.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ width: 44, height: 44, background: '#FDF2F8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      {lp.gender === 'female' ? '👩' : '👴'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{lp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Age {lp.age} · {lp.description?.slice(0, 50)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#EC4899' }}>QR: {lp.qr_code}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Community Posts */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#22C55E' }}>📢 Community Updates</h3>
                {posts.slice(0, 4).map((p: any) => (
                  <div key={p.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{p.post_type}</span>
                      {p.is_verified && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Verified</span>}
                    </div>
                    <div>{p.message.slice(0, 80)}{p.message.length > 80 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
