'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

const statusColor = { AVAILABLE: '#22C55E', LOW: '#F59E0B', EMPTY: '#EF4444', MAINTENANCE: '#9CA3AF' };
const statusIcon = { AVAILABLE: '💧', LOW: '⚠️', EMPTY: '❌', MAINTENANCE: '🔧' };

export default function WaterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { apiCall(`/water/nearby?lat=${LAT}&lon=${LON}&radius_km=10`).then(d => { setItems(d); setLoading(false); }); }, []);
  const filtered = filter === 'ALL' ? items : items.filter(i => i.status === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div><h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>💧 Water Points</h1><p style={{ fontSize: '0.8rem', color: '#6B7280' }}>पाण्याचे ठिकाण — Find nearest water</p></div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'AVAILABLE', 'LOW', 'EMPTY'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filtered.map((wp: any) => (
                <div key={wp.id} className="card" style={{ borderTop: `3px solid ${statusColor[wp.status as keyof typeof statusColor] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h4>{wp.name}</h4>
                    <span style={{ fontSize: '1.5rem' }}>{statusIcon[wp.status as keyof typeof statusIcon]}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Distance</div><div style={{ fontWeight: 700 }}>{wp.distance_m}m</div></div>
                    <div><div style={{ color: '#6B7280' }}>Type</div><div style={{ fontWeight: 700 }}>{wp.water_type}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Capacity</div><div style={{ fontWeight: 700 }}>{wp.capacity_liters}L</div></div>
                    <div><div style={{ color: '#6B7280' }}>Status</div><div style={{ fontWeight: 700, color: statusColor[wp.status as keyof typeof statusColor] }}>{wp.status}</div></div>
                  </div>
                  <button className="btn btn-secondary btn-sm btn-full">🗺️ Get Directions</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
