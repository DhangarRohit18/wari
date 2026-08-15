'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function MedicalCampsPage() {
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampCapacity, setNewCampCapacity] = useState(10);
  const [newCampSpec, setNewCampSpec] = useState('');

  useEffect(() => {
    apiCall('/medical').then(data => { 
      // Force some mock data if empty for demo
      if (!data || data.length === 0) {
        data = [
          { id: 'c1', name: 'Ghat Base Medical', available: true, capacity: 25, location_type: 'MOBILE_CLINIC', has_ambulance: true, doctor_available: true, specialties: ['Trauma'] }
        ];
      }
      setCamps(data); 
      setLoading(false); 
    });
  }, []);

  const handleAddCamp = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp = {
      id: `c${Date.now()}`,
      name: newCampName,
      available: true,
      capacity: newCampCapacity,
      location_type: 'TENT',
      has_ambulance: false,
      doctor_available: true,
      specialties: newCampSpec.split(',').map(s => s.trim()).filter(Boolean),
      latitude: 17.67 + Math.random() * 0.01,
      longitude: 75.32 + Math.random() * 0.01,
    };
    setCamps([newCamp, ...camps]);
    setShowAddModal(false);
    setNewCampName('');
    setNewCampSpec('');
  };

  const handleDeleteCamp = (id: string) => {
    if (confirm("Remove this medical camp?")) {
      setCamps(camps.filter(c => c.id !== id));
    }
  };

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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-green">{available} Available</span>
            <span className="badge badge-red">{camps.length - available} Full</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} style={{ marginLeft: '1rem' }}>
              ➕ Register Camp
            </button>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {(camp.specialties || []).length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {camp.specialties.map((sp: string) => (
                          <span key={sp} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{sp}</span>
                        ))}
                      </div>
                    ) : <div />}
                    <button onClick={() => handleDeleteCamp(camp.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem', fontSize: '1rem' }} title="Remove Camp">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', gridColumn: '1/-1' }}>No camps found</div>}
            </div>
          )}
        </div>

        {/* Add Medical Camp Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Register Medical Camp</h2>
              <form onSubmit={handleAddCamp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Camp Name</label>
                  <input type="text" value={newCampName} onChange={e => setNewCampName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Wakhari Emergency Tent" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Capacity (Beds)</label>
                  <input type="number" value={newCampCapacity} onChange={e => setNewCampCapacity(Number(e.target.value))} required min={1} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Specialties (Comma Separated)</label>
                  <input type="text" value={newCampSpec} onChange={e => setNewCampSpec(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Trauma, General" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register Camp</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
