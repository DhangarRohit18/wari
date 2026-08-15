'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function MedicalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const LAT = 17.6741, LON = 75.3279;
  useEffect(() => { apiCall(`/medical/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).then(d => { setItems(d); setLoading(false); }); }, []);
  const typeColor: Record<string, string> = { hospital: '#8B5CF6', camp: '#3B82F6', first_aid: '#F97316', ambulance: '#EF4444' };
  const typeIcon: Record<string, string> = { hospital: '🏥', camp: '⛺', first_aid: '🩺', ambulance: '🚑' };
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div><h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🏥 Medical Assistance</h1><p style={{ fontSize: '0.8rem', color: '#6B7280' }}>वैद्यकीय सहायता — Hospitals, Camps, First Aid</p></div>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {items.map((ml: any) => (
                <div key={ml.id} className="card" style={{ borderTop: `3px solid ${typeColor[ml.location_type] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.25rem' }}>{typeIcon[ml.location_type] || '🏥'}</div>
                      <h4>{ml.name}</h4>
                    </div>
                    <span className={`badge ${ml.available ? 'badge-green' : 'badge-red'}`}>{ml.available ? '✓ Available' : '✗ Full'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Distance</div><div style={{ fontWeight: 700 }}>{ml.distance_m}m</div></div>
                    <div><div style={{ color: '#6B7280' }}>Type</div><div style={{ fontWeight: 700 }}>{ml.location_type}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Capacity</div><div style={{ fontWeight: 700 }}>{ml.capacity}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Hours</div><div style={{ fontWeight: 700 }}>{ml.operating_hours}</div></div>
                  </div>
                  {ml.services?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {ml.services.map((s: string) => <span key={s} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{s}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm">📞 Contact</button>
                    <button className="btn btn-primary btn-sm">🗺️ Directions</button>
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
