'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function CleanerIssuesPage() {
  const token = getToken();
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string | null>(null);

  useEffect(() => {
    apiCall('/toilets').then(data => {
      setToilets(data.filter((t: any) => ['NEEDS_CLEANING', 'MAINTENANCE'].includes(t.status)));
      setLoading(false);
    });
  }, []);

  const markCleaned = async (toiletId: string) => {
    setCleaning(toiletId);
    try {
      await apiCall(`/toilets/${toiletId}/clean`, { method: 'POST', body: JSON.stringify({ issues: null }) }, token);
      setToilets(prev => prev.filter(t => t.id !== toiletId));
    } catch (e: any) { alert(e.message); }
    setCleaning(null);
  };

  const maintenanceCount = toilets.filter(t => t.status === 'MAINTENANCE').length;
  const dirtyCount = toilets.filter(t => t.status === 'NEEDS_CLEANING').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>⚠️ Issues & Maintenance</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Toilets requiring immediate attention</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-yellow">{dirtyCount} Need Cleaning</span>
            <span className="badge badge-red">{maintenanceCount} Maintenance</span>
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : toilets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: '#22C55E' }}>All Clear!</h2>
              <p style={{ color: '#6B7280' }}>No issues reported. All toilets are clean.</p>
            </div>
          ) : (
            <>
              {maintenanceCount > 0 && (
                <div style={{ background: '#FEE2E2', border: '2px solid #EF4444', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔧</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#DC2626' }}>{maintenanceCount} toilet(s) under maintenance</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>These require technical team attention</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {toilets.map((t: any) => (
                  <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.status === 'MAINTENANCE' ? '#EF4444' : '#F59E0B'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4>{t.name}</h4>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.total_units} units · {t.gender}</div>
                      </div>
                      <span className={`badge ${t.status === 'MAINTENANCE' ? 'badge-red' : 'badge-yellow'}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                      🕐 Last cleaned: {t.minutes_since_cleaned !== null ? `${t.minutes_since_cleaned} min ago` : 'Never recorded'}{' · '}
                      ⭐ {t.rating}
                    </div>
                    {t.status === 'NEEDS_CLEANING' && (
                      <button className="btn btn-primary btn-sm btn-full"
                        style={{ background: '#F97316' }}
                        onClick={() => markCleaned(t.id)}
                        disabled={cleaning === t.id}>
                        {cleaning === t.id ? '⏳ Marking...' : '🧹 Mark as Cleaned'}
                      </button>
                    )}
                    {t.status === 'MAINTENANCE' && (
                      <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '0.5rem', fontSize: '0.8rem', color: '#DC2626' }}>
                        🔧 Requires technical team — do not use
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
