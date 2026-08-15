'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function CleanerLogPage() {
  const [toilets, setToilets] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    apiCall('/toilets').then(data => {
      setToilets(data);
      setLoading(false);
      if (data.length > 0) {
        setSelected(data[0].id);
        loadHistory(data[0].id);
      }
    });
  }, []);

  const loadHistory = async (id: string) => {
    setHistLoading(true);
    try {
      const data = await apiCall(`/toilets/${id}/history`);
      setHistory(data);
    } catch { setHistory([]); }
    setHistLoading(false);
  };

  const selectToilet = (id: string) => {
    setSelected(id);
    loadHistory(id);
  };

  const selectedToilet = toilets.find(t => t.id === selected);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📋 Cleaning Log</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Full cleaning history per toilet block</p>
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
              {/* Toilet list */}
              <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: '0.9rem' }}>
                  🚻 Select Toilet Block
                </div>
                {toilets.map((t: any) => (
                  <button key={t.id} onClick={() => selectToilet(t.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                      background: selected === t.id ? '#FFF7ED' : 'transparent',
                      borderLeft: selected === t.id ? '3px solid #F97316' : '3px solid transparent',
                      border: 'none', cursor: 'pointer', borderBottom: '1px solid #F3F4F6',
                    }}>
                    <div style={{ fontWeight: selected === t.id ? 700 : 400, fontSize: '0.875rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{t.total_units} units · {t.status}</div>
                  </button>
                ))}
              </div>

              {/* History */}
              <div>
                {selectedToilet && (
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedToilet.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{selectedToilet.total_units} units · Rating: ⭐ {selectedToilet.rating}</div>
                      </div>
                      <span className={`badge ${selectedToilet.status === 'CLEAN' ? 'badge-green' : 'badge-yellow'}`}>{selectedToilet.status}</span>
                    </div>
                  </div>
                )}
                <div className="card">
                  <h3 style={{ marginBottom: '1rem' }}>🕐 Cleaning History</h3>
                  {histLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 32, height: 32, margin: 'auto' }} /></div>
                  ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No cleaning records found</div>
                  ) : (
                    <div>
                      {history.map((log: any, i: number) => (
                        <div key={log.id || i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid #F3F4F6' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                            🧹
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                              Cleaned by: {log.cleaned_by?.slice(0, 8) || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              {new Date(log.cleaned_at).toLocaleString()}
                            </div>
                            {log.issues && (
                              <div style={{ marginTop: '0.25rem', background: '#FEF9C3', borderRadius: 6, padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#92400E' }}>
                                ⚠️ Issue: {log.issues}
                              </div>
                            )}
                            {log.status_before && (
                              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                                Was: {log.status_before} → CLEAN
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
