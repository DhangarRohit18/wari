'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function MedicalCampsPage() {
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall('/medical').then(data => { setCamps(data); setLoading(false); });
  }, []);

  const filtered = filter === 'ALL' ? camps : camps.filter(c => filter === 'AVAILABLE' ? c.available : !c.available);
  const available = camps.filter(c => c.available).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>⛺ Medical Camps</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All medical facilities along the Wari route</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-green">{available} Available</span>
            <span className="badge badge-red">{camps.length - available} Full</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Camps', value: camps.length, color: '#8B5CF6', icon: '⛺' },
              { label: 'Available', value: available, color: '#22C55E', icon: '✅' },
              { label: 'Full / Busy', value: camps.length - available, color: '#EF4444', icon: '🔴' },
              { label: 'Total Capacity', value: camps.reduce((a, c) => a + (c.capacity || 0), 0), color: '#3B82F6', icon: '👥' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['ALL', 'AVAILABLE', 'FULL'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filtered.map((camp: any) => (
                <div key={camp.id} className="card" style={{ borderTop: `3px solid ${camp.available ? '#22C55E' : '#EF4444'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{camp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{camp.location_type}</div>
                    </div>
                    <span className={`badge ${camp.available ? 'badge-green' : 'badge-red'}`}>
                      {camp.available ? '✓ Available' : '✗ Full'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    <div>👥 Capacity: <strong>{camp.capacity}</strong></div>
                    <div>📍 {camp.latitude?.toFixed(3)}, {camp.longitude?.toFixed(3)}</div>
                    <div>{camp.has_ambulance ? '🚑 Ambulance' : '🚶 Walk-in only'}</div>
                    <div>{camp.doctor_available ? '👨‍⚕️ Doctor On-site' : '⏳ On-call'}</div>
                  </div>
                  {(camp.specialties || []).length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {camp.specialties.map((sp: string) => (
                        <span key={sp} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{sp}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No camps found</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
