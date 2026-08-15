'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function MedicalAmbulancePage() {
  const token = getToken();
  const [sos, setSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/sos', {}, token).then(data => {
      // Show MEDICAL + ACCIDENT cases that are not resolved
      setSos(data.filter((s: any) =>
        ['MEDICAL', 'ACCIDENT', 'FATIGUE', 'DEHYDRATION'].includes(s.category) &&
        !['RESOLVED', 'CANCELLED'].includes(s.status)
      ));
      setLoading(false);
    });
  }, []);

  const dispatch = async (id: string) => {
    try {
      await apiCall(`/sos/${id}/assign`, { method: 'POST' }, token);
      setSos(prev => prev.map(s => s.id === id ? { ...s, status: 'MEDICAL_ASSIGNED' } : s));
    } catch (e: any) { alert(e.message); }
  };

  const resolve = async (id: string) => {
    await apiCall(`/sos/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESOLVED' }) }, token);
    setSos(prev => prev.filter(s => s.id !== id));
  };

  const urgent = sos.filter(s => s.status === 'CREATED');
  const dispatched = sos.filter(s => s.status !== 'CREATED');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚑 Ambulance Dispatch</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Medical & accident emergencies requiring transport</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-red">{urgent.length} Awaiting Dispatch</span>
            <span className="badge badge-yellow">{dispatched.length} En Route</span>
          </div>
        </header>
        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : sos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ color: '#22C55E' }}>No Pending Dispatches</h2>
              <p style={{ color: '#6B7280' }}>All ambulances are available.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Awaiting Dispatch */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>🆘 Awaiting Dispatch ({urgent.length})</h3>
                {urgent.map((s: any) => (
                  <div key={s.id} className="card card-sm sos-card" style={{ marginBottom: '0.75rem', borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#EF4444', marginBottom: '0.25rem' }}>{s.category}</div>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.375rem' }}>{s.description || 'Emergency transport needed'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                      {s.blood_group && ` · 🩸 ${s.blood_group}`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                      ⏱ {new Date(s.created_at).toLocaleTimeString()}
                    </div>
                    <button className="btn btn-danger btn-sm btn-full" onClick={() => dispatch(s.id)}>
                      🚑 Dispatch Ambulance
                    </button>
                  </div>
                ))}
                {urgent.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>None waiting</p>}
              </div>

              {/* En Route */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#F97316' }}>🚑 En Route ({dispatched.length})</h3>
                {dispatched.map((s: any) => (
                  <div key={s.id} className="card card-sm" style={{ marginBottom: '0.75rem', borderLeft: '4px solid #F97316' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F97316', marginBottom: '0.25rem' }}>{s.category}</div>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.375rem' }}>{s.description || 'En route to patient'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                      Responder: {s.responder_name || 'Assigned'}{s.responder_distance_m ? ` · ${s.responder_distance_m}m away` : ''}
                    </div>
                    <span className="badge badge-orange">{s.status.replace('_', ' ')}</span>
                    <button className="btn btn-sm btn-full" style={{ marginTop: '0.5rem', background: '#22C55E', color: 'white' }} onClick={() => resolve(s.id)}>
                      ✅ Mark Delivered
                    </button>
                  </div>
                ))}
                {dispatched.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>None en route</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
