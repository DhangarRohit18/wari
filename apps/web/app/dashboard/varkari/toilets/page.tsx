'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ToiletsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const LAT = 17.6741, LON = 75.3279;
  useEffect(() => { apiCall(`/toilets/nearby?lat=${LAT}&lon=${LON}&radius_km=5`).then(d => { setItems(d); setLoading(false); }); }, []);
  const statusColor = { CLEAN: '#22C55E', NEEDS_CLEANING: '#F59E0B', MAINTENANCE: '#EF4444', CLOSED: '#9CA3AF' };
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div><h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚻 Toilets / Sauchalay</h1><p style={{ fontSize: '0.8rem', color: '#6B7280' }}>शौचालय — Find clean toilets nearby</p></div>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {items.map((t: any) => (
                <div key={t.id} className="card" style={{ borderTop: `3px solid ${statusColor[t.status as keyof typeof statusColor] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4>{t.name}</h4>
                    <span className={`badge ${t.status === 'CLEAN' ? 'badge-green' : t.status === 'NEEDS_CLEANING' ? 'badge-yellow' : 'badge-red'}`}>{t.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Distance</div><div style={{ fontWeight: 700 }}>{t.distance_m}m</div></div>
                    <div><div style={{ color: '#6B7280' }}>Last Cleaned</div><div style={{ fontWeight: 700, color: t.minutes_since_cleaned > 60 ? '#F59E0B' : '#22C55E' }}>{t.minutes_since_cleaned} min ago</div></div>
                    <div><div style={{ color: '#6B7280' }}>Units</div><div style={{ fontWeight: 700 }}>{t.total_units}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Rating</div><div style={{ fontWeight: 700 }}>⭐ {t.rating}</div></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Gender: {t.gender} · QR: {t.qr_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
