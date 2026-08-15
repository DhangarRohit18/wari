'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function ShelterPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(`/shelters/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).then(d => {
      setShelters(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🏠 Stay & Shelters</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>निवास — Find safe rest areas and night shelters nearby</p>
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {shelters.map((s: any) => {
                const available = s.capacity - s.current_occupancy;
                return (
                  <div key={s.id} className="card" style={{ borderTop: `3px solid ${available > 50 ? '#22C55E' : available > 0 ? '#F59E0B' : '#EF4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{s.name}</h4>
                      <span className={`badge ${available > 0 ? 'badge-green' : 'badge-red'}`}>
                        {available > 0 ? `${available} Spots Left` : 'FULL'}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                      <div className="progress-fill" style={{
                        width: `${Math.min(100, (s.current_occupancy / s.capacity) * 100)}%`,
                        background: available > 50 ? '#22C55E' : available > 0 ? '#F59E0B' : '#EF4444'
                      }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      <div><div style={{ color: '#6B7280' }}>Distance</div><div style={{ fontWeight: 700 }}>{s.distance_m}m</div></div>
                      <div><div style={{ color: '#6B7280' }}>Occupancy</div><div style={{ fontWeight: 700 }}>{s.current_occupancy} / {s.capacity}</div></div>
                      <div><div style={{ color: '#6B7280' }}>Family Area</div><div style={{ fontWeight: 700 }}>{s.is_family_suitable ? '✅ Yes' : '❌ No'}</div></div>
                      <div><div style={{ color: '#6B7280' }}>Verified</div><div style={{ fontWeight: 700 }}>{s.is_verified ? '⭐ Verified' : 'Standard'}</div></div>
                    </div>
                    <button className="btn btn-primary btn-sm btn-full" onClick={() => alert(`Directions to ${s.name} starting...`)}>
                      🗺️ Get Directions
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
