'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ProviderWellnessPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/wellness').then(d => { setCentres(d); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🌿 My Wellness Centre</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Service Provider — Foot care and wellness services</p>
          </div>
          <span className="badge badge-green">{centres.filter(c => c.available).length}/{centres.length} Open</span>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Centres', value: centres.length, color: '#22C55E', icon: '🌿' },
              { label: 'Open Now', value: centres.filter(c => c.available).length, color: '#22C55E', icon: '✅' },
              { label: 'Foot Care', value: centres.filter(c => c.service_type === 'FOOT_CARE').length, color: '#8B5CF6', icon: '🦶' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {centres.map((c: any) => (
                <div key={c.id} className="card" style={{ borderTop: `3px solid ${c.available ? '#22C55E' : '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{c.service_type}</div>
                    </div>
                    <span className={`badge ${c.available ? 'badge-green' : 'badge-gray'}`}>{c.available ? 'Open' : 'Closed'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.8rem', color: '#6B7280' }}>
                    {c.queue_minutes !== undefined && <div>⏳ Queue: {c.queue_minutes} min</div>}
                    {c.rating && <div>⭐ {c.rating}</div>}
                    {c.is_free && <div style={{ color: '#22C55E', fontWeight: 600 }}>💚 Free service</div>}
                    {c.volunteer_run && <div>🤝 Volunteer-run</div>}
                  </div>
                </div>
              ))}
              {centres.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No wellness centres registered</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
