'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function CleanerDashboard() {
  const token = getToken();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wv_user') || '{}') : {};
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});

  useEffect(() => {
    apiCall('/toilets').then(data => { setToilets(data); setLoading(false); });
  }, []);

  const markCleaned = async (toiletId: string) => {
    setCleaning(toiletId);
    try {
      await apiCall(`/toilets/${toiletId}/clean`, { method: 'POST', body: JSON.stringify({ issues: issues[toiletId] || null }) }, token);
      setToilets(prev => prev.map(t => t.id === toiletId ? { ...t, status: 'CLEAN', minutes_since_cleaned: 0 } : t));
      setIssues(prev => ({ ...prev, [toiletId]: '' }));
    } catch (e: any) { alert(e.message); }
    setCleaning(null);
  };

  const statusColor: Record<string, string> = { CLEAN: '#22C55E', NEEDS_CLEANING: '#F59E0B', MAINTENANCE: '#EF4444', CLOSED: '#9CA3AF' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🧹 Cleaner Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-yellow">{toilets.filter(t => t.status === 'NEEDS_CLEANING').length} Need Cleaning</span>
            <span className="badge badge-green">{toilets.filter(t => t.status === 'CLEAN').length} Clean</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Need Cleaning', value: toilets.filter(t => t.status === 'NEEDS_CLEANING').length, color: '#F59E0B', icon: '🧹' },
              { label: 'Clean', value: toilets.filter(t => t.status === 'CLEAN').length, color: '#22C55E', icon: '✅' },
              { label: 'Maintenance', value: toilets.filter(t => t.status === 'MAINTENANCE').length, color: '#EF4444', icon: '🔧' },
              { label: 'Avg Clean Time', value: `${Math.round(toilets.filter(t => t.minutes_since_cleaned).reduce((a, t) => a + t.minutes_since_cleaned, 0) / Math.max(toilets.filter(t => t.minutes_since_cleaned).length, 1))} min`, color: '#6366F1', icon: '⏱️' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>

              {/* Mobile-Only Navigation Grid */}
              <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.875rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Navigation</h3>
                <div className="mobile-only grid">
                  {[
                    { icon: '🗺️', labelKey: 'Map View', path: '/dashboard/varkari/map', border: '#16A34A' },
                    { icon: '📋', labelKey: 'Task List', path: '/dashboard/cleaner/tasks', border: '#0891B2' },
                    { icon: '🧹', labelKey: 'Inventory', path: '/dashboard/cleaner/inventory', border: '#2563EB' }
                  ].map(({ icon, labelKey, path, border }) => (
                    <a key={path} href={path} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', padding: '1rem', borderTop: `4px solid ${border}` }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', textAlign: 'center' }}>{labelKey}</span>
                    </a>
                  ))}
                </div>
              </div>
<div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {[...toilets].sort((a, b) => {
                const order = { NEEDS_CLEANING: 0, MAINTENANCE: 1, CLEAN: 2, CLOSED: 3 };
                return (order[a.status as keyof typeof order] || 2) - (order[b.status as keyof typeof order] || 2);
              }).map((toilet: any) => (
                <div key={toilet.id} className="card" style={{ borderLeft: `4px solid ${statusColor[toilet.status] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ marginBottom: '0.25rem' }}>{toilet.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{toilet.total_units} units · {toilet.gender}</div>
                    </div>
                    <span className="badge" style={{ background: `${statusColor[toilet.status]}20`, color: statusColor[toilet.status] }}>
                      {toilet.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    🕐 Last cleaned: {toilet.minutes_since_cleaned !== null ? `${toilet.minutes_since_cleaned} min ago` : 'Unknown'}
                    {' · '}⭐ {toilet.rating}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>📱 QR: {toilet.qr_code}</div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <input className="input" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
                      placeholder="Issue notes (optional)..."
                      value={issues[toilet.id] || ''}
                      onChange={e => setIssues(prev => ({ ...prev, [toilet.id]: e.target.value }))} />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => markCleaned(toilet.id)}
                      disabled={cleaning === toilet.id}
                      style={{ background: toilet.status === 'CLEAN' ? '#22C55E' : '#F97316' }}
                    >
                      {cleaning === toilet.id ? '⏳ Marking...' : toilet.status === 'CLEAN' ? '✅ Cleaned' : '🧹 Mark as Cleaned'}
                    </button>
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
