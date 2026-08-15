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
                <div key={ml.id} style={{ 
                  background: ml.location_type === 'hospital' ? 'linear-gradient(145deg, #F5F3FF, #EDE9FE)' :
                              ml.location_type === 'camp' ? 'linear-gradient(145deg, #EFF6FF, #DBEAFE)' :
                              ml.location_type === 'first_aid' ? 'linear-gradient(145deg, #FFF7ED, #FFEDD5)' :
                              'linear-gradient(145deg, #FEF2F2, #FEE2E2)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative subtle background icon */}
                  <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '6rem', opacity: 0.05, pointerEvents: 'none' }}>
                    {typeIcon[ml.location_type] || '🏥'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.75rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {typeIcon[ml.location_type] || '🏥'}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem', margin: 0 }}>{ml.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: typeColor[ml.location_type], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {ml.location_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '12px' }}>
                    <div><div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>DISTANCE</div><div style={{ fontWeight: 800, color: '#334155' }}>📍 {ml.distance_m}m</div></div>
                    <div><div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>CAPACITY</div><div style={{ fontWeight: 800, color: '#334155' }}>{ml.capacity} beds</div></div>
                    <div><div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>HOURS</div><div style={{ fontWeight: 800, color: '#334155' }}>{ml.operating_hours}</div></div>
                    <div><div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>STATUS</div>
                      <span style={{ fontWeight: 800, color: ml.available ? '#16A34A' : '#DC2626' }}>{ml.available ? '● Available' : '● Full'}</span>
                    </div>
                  </div>

                  {ml.services?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                      {ml.services.map((s: string) => <span key={s} style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, color: '#475569', border: '1px solid rgba(0,0,0,0.05)' }}>{s}</span>)}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button className="btn btn-sm" style={{ background: 'white', color: '#1E293B', border: '1px solid #E2E8F0', fontWeight: 600 }}>📞 Contact</button>
                    <button className="btn btn-sm" style={{ background: typeColor[ml.location_type], color: 'white', fontWeight: 600, border: 'none' }}>🗺️ Directions</button>
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
