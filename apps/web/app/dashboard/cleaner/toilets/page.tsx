'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function CleanerToiletsPage() {
  const token = getToken();
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall('/toilets').then(data => { setToilets(data); setLoading(false); });
  }, []);

  const markCleaned = async (toiletId: string) => {
    setCleaning(toiletId);
    try {
      await apiCall(`/toilets/${toiletId}/clean`, {
        method: 'POST',
        body: JSON.stringify({ issues: issues[toiletId] || null })
      }, token);
      setToilets(prev => prev.map(t => t.id === toiletId ? { ...t, status: 'CLEAN', minutes_since_cleaned: 0 } : t));
      setIssues(prev => ({ ...prev, [toiletId]: '' }));
    } catch (e: any) { alert(e.message); }
    setCleaning(null);
  };

  const statusColor: Record<string, string> = {
    CLEAN: '#22C55E', NEEDS_CLEANING: '#F59E0B', MAINTENANCE: '#EF4444', CLOSED: '#9CA3AF',
  };

  const filtered = filter === 'ALL' ? toilets : toilets.filter(t => t.status === filter);
  const priority = ['NEEDS_CLEANING', 'MAINTENANCE', 'CLEAN', 'CLOSED'];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚻 My Assigned Toilets</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Prioritized by cleaning need</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-yellow">{toilets.filter(t => t.status === 'NEEDS_CLEANING').length} urgent</span>
            <span className="badge badge-green">{toilets.filter(t => t.status === 'CLEAN').length} clean</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['ALL', 'NEEDS_CLEANING', 'CLEAN', 'MAINTENANCE'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}>
                {f.replace('_', ' ')} {f !== 'ALL' && `(${toilets.filter(t => t.status === f).length})`}
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => (priority.indexOf(a.status) - priority.indexOf(b.status))).map((t: any) => (
                <div key={t.id} className="card" style={{ borderLeft: `4px solid ${statusColor[t.status] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ marginBottom: '0.25rem' }}>{t.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.total_units} units · {t.gender}</div>
                    </div>
                    <span className="badge" style={{ background: `${statusColor[t.status]}20`, color: statusColor[t.status] }}>{t.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    🕐 Last cleaned: {t.minutes_since_cleaned !== null ? `${t.minutes_since_cleaned} min ago` : 'Unknown'}{' · '}
                    ⭐ {t.rating}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <input className="input" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
                      placeholder="Issue notes (optional)..."
                      value={issues[t.id] || ''}
                      onChange={e => setIssues(prev => ({ ...prev, [t.id]: e.target.value }))} />
                    <button className="btn btn-primary btn-sm"
                      onClick={() => markCleaned(t.id)}
                      disabled={cleaning === t.id}
                      style={{ background: t.status === 'CLEAN' ? '#22C55E' : '#F97316' }}>
                      {cleaning === t.id ? '⏳ Marking...' : t.status === 'CLEAN' ? '✅ Re-check Clean' : '🧹 Mark as Cleaned'}
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
