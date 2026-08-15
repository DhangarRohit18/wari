'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function ProviderChargingPage() {
  const [wellness, setWellness] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/wellness').then(d => { setWellness(d); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>⚡ Charging Stations</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Mobile charging services for Varkaris</p>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '3rem' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FED7AA' }}>Charging & Connectivity Services</div>
                <p style={{ color: '#9CA3AF', marginTop: '0.375rem', fontSize: '0.875rem' }}>
                  Charging stations are listed under wellness centres. Provide power banks, charging points, and Wi-Fi hotspots for pilgrims.
                </p>
              </div>
            </div>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {wellness.filter((w: any) => w.available).map((c: any) => (
                <div key={c.id} className="card" style={{ borderTop: '3px solid #F59E0B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div><div style={{ fontWeight: 700 }}>⚡ {c.name}</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Mobile charging point</div></div>
                    <span className="badge badge-green">Open</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {c.distance_m && <div>📍 {c.distance_m}m away</div>}
                    {c.queue_minutes !== undefined && <div>⏳ Wait: {c.queue_minutes} min</div>}
                    {c.is_free && <div style={{ color: '#22C55E', fontWeight: 600, marginTop: '0.25rem' }}>💚 Free charging</div>}
                  </div>
                </div>
              ))}
              {wellness.filter((w: any) => w.available).length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                  <p>No charging stations currently active</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
