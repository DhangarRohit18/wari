'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function VarkariWellnessPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall(`/wellness/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).then(d => {
      setCentres(d);
      setLoading(false);
    });
  }, []);

  const SERVICE_ICONS: Record<string, string> = {
    FOOT_CARE: '🦶', AYURVEDIC: '🌿', PHYSIOTHERAPY: '💆', GENERAL: '🏥',
  };

  const types = ['ALL', ...Array.from(new Set(centres.map((c: any) => c.service_type).filter(Boolean)))];
  const filtered = filter === 'ALL' ? centres : centres.filter((c: any) => c.service_type === filter);
  const available = centres.filter((c: any) => c.available).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🌿 Wellness & Foot Care</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>पाय सेवा — Ayurvedic and foot care centres nearby</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-green">{available} Open</span>
            <span className="badge badge-gray">{centres.length - available} Closed</span>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Wellness tip banner */}
          <div style={{ background: 'linear-gradient(135deg, #14532D 0%, #166534 100%)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>🦶</span>
            <div>
              <div style={{ color: '#BBF7D0', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>वारीकरांसाठी पाय सेवा</div>
              <p style={{ color: '#86EFAC', fontSize: '0.8rem', lineHeight: 1.5 }}>
                Long walks strain your feet and legs. Ayurvedic foot massage, physiotherapy camps, and rest centres are available along the route. Visit regularly to avoid fatigue and blisters.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Open Now', value: available, color: '#22C55E', icon: '✅' },
              { label: 'Foot Care', value: centres.filter((c: any) => c.service_type === 'FOOT_CARE').length, color: '#8B5CF6', icon: '🦶' },
              { label: 'Ayurvedic', value: centres.filter((c: any) => c.service_type === 'AYURVEDIC').length, color: '#22C55E', icon: '🌿' },
              { label: 'Free Services', value: centres.filter((c: any) => c.is_free).length, color: '#F97316', icon: '💚' },
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
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {types.map(t => (
              <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(t)}>
                {SERVICE_ICONS[t] || ''} {t.replace('_', ' ')} {t !== 'ALL' && `(${centres.filter((c: any) => c.service_type === t).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0) || (a.distance_m || 0) - (b.distance_m || 0))
                .map((c: any) => (
                  <div key={c.id} className="card" style={{ borderTop: `3px solid ${c.available ? '#22C55E' : '#9CA3AF'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: c.available ? '#DCFCE7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                          {SERVICE_ICONS[c.service_type] || '🌿'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{c.service_type?.replace('_', ' ') || 'Wellness'}</div>
                        </div>
                      </div>
                      <span className={`badge ${c.available ? 'badge-green' : 'badge-gray'}`}>{c.available ? 'Open' : 'Closed'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                      {c.distance_m !== undefined && <div>📍 {c.distance_m}m · ~{Math.round(c.distance_m / 80)} min walk</div>}
                      {c.queue_minutes !== undefined && (
                        <div style={{ color: c.queue_minutes > 20 ? '#EF4444' : '#22C55E', fontWeight: 600 }}>
                          ⏳ {c.queue_minutes} min wait
                        </div>
                      )}
                      {c.rating && <div>⭐ {c.rating}</div>}
                      {c.volunteer_run && <div>🤝 Volunteer-run</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {c.is_free && (
                        <span style={{ background: '#DCFCE7', color: '#15803D', borderRadius: 20, padding: '0.125rem 0.625rem', fontSize: '0.7rem', fontWeight: 700 }}>
                          💚 Free Service
                        </span>
                      )}
                      {c.has_ayurvedic_oil && (
                        <span style={{ background: '#FEF9C3', color: '#92400E', borderRadius: 20, padding: '0.125rem 0.625rem', fontSize: '0.7rem', fontWeight: 700 }}>
                          🌿 Ayurvedic Oil
                        </span>
                      )}
                      {c.has_bandage && (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 20, padding: '0.125rem 0.625rem', fontSize: '0.7rem', fontWeight: 700 }}>
                          🩹 First Aid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
                  <p>No wellness centres found nearby</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
