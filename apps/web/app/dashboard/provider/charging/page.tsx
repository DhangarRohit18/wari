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
              {(() => {
                let stations = wellness.filter((w: any) => w.available);
                if (stations.length === 0) {
                  // Fallback dummy data if no actual wellness centres are available
                  stations = [
                    { id: 'dummy-1', name: 'Wakhari Trust Charging Hub', distance_m: 150, queue_minutes: 5, is_free: true },
                    { id: 'dummy-2', name: 'BSNL Mobile Wi-Fi & Charge Point', distance_m: 350, queue_minutes: 15, is_free: true },
                    { id: 'dummy-3', name: 'Private Pay-and-Charge Tent', distance_m: 800, queue_minutes: 2, is_free: false },
                  ];
                }

                return stations.map((c: any) => (
                  <div key={c.id} className="card" style={{ borderTop: '3px solid #F59E0B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div><div style={{ fontWeight: 700 }}>⚡ {c.name}</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Mobile charging point</div></div>
                      <span className="badge badge-green">Open</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      {c.distance_m !== undefined && <div>📍 {c.distance_m}m away</div>}
                      {c.queue_minutes !== undefined && <div>⏳ Wait: {c.queue_minutes} min</div>}
                      <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                        {c.is_free ? <span style={{ color: '#22C55E' }}>💚 Free charging</span> : <span style={{ color: '#F97316' }}>🪙 Paid service</span>}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
