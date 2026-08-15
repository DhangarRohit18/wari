'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function NGOVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall(`/volunteers/nearby?lat=${LAT}&lon=${LON}&radius_km=20`),
      apiCall(`/help/needs?lat=${LAT}&lon=${LON}`),
    ]).then(([v, n]) => { setVolunteers(v); setNeeds(n); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🤝 Volunteer Coordination</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>NGO — Nearby volunteers and open help requests</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-green">{volunteers.length} Available</span>
            <span className="badge badge-orange">{needs.length} Requests</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available Volunteers', value: volunteers.length, color: '#22C55E', icon: '🤝' },
              { label: 'Open Requests', value: needs.length, color: '#F97316', icon: '🙋' },
              { label: 'Gap', value: Math.max(0, needs.length - volunteers.length), color: '#EF4444', icon: '⚠️' },
              { label: 'Coverage', value: volunteers.length >= needs.length ? '✅ Good' : '⚠️ Low', color: volunteers.length >= needs.length ? '#22C55E' : '#EF4444', icon: '📊' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#22C55E' }}>🤝 Available Volunteers ({volunteers.length})</h3>
                {volunteers.length === 0 ? <p style={{ color: '#9CA3AF' }}>No volunteers nearby</p> : volunteers.map((v: any) => (
                  <div key={v.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Volunteer #{v.user_id?.slice(0, 8)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {v.distance_m}m away · Skills: {(v.skills || []).join(', ') || 'General'}
                      </div>
                    </div>
                    <span className="badge badge-green">{v.status}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#F97316' }}>🙋 Open Help Requests ({needs.length})</h3>
                {needs.length === 0 ? <p style={{ color: '#9CA3AF' }}>No open requests</p> : needs.map((n: any) => (
                  <div key={n.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.category}</span>
                      <span className={`badge ${n.urgency >= 8 ? 'badge-red' : n.urgency >= 5 ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                        Urgency {n.urgency}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{n.description || 'Help needed'} · {n.distance_m}m away</div>
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
