'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function NGOVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVolName, setNewVolName] = useState('');
  const [newVolPhone, setNewVolPhone] = useState('');
  const [newVolSkills, setNewVolSkills] = useState('');

  useEffect(() => {
    // Initial fetch, fallback to a local hardcoded array if API is empty
    Promise.all([
      apiCall(`/volunteers/nearby?lat=${LAT}&lon=${LON}&radius_km=20`),
      apiCall(`/help/needs?lat=${LAT}&lon=${LON}`),
    ]).then(([v, n]) => { 
      // Force some mock data if API returns empty for the pitch video
      if (!v || v.length === 0) {
        v = [
          { id: 'v1', user_id: 'Anand Shinde', distance_m: 150, skills: ['First Aid', 'Crowd Control'], status: 'AVAILABLE' },
          { id: 'v2', user_id: 'Sunita Patil', distance_m: 450, skills: ['Food Dist', 'Local Guide'], status: 'ASSIGNED' },
        ];
      }
      setVolunteers(v); 
      setNeeds(n || []); 
      setLoading(false); 
    });
  }, []);

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    const newVol = {
      id: `v${Date.now()}`,
      user_id: newVolName || 'New Volunteer',
      distance_m: Math.floor(Math.random() * 500) + 50, // random 50-550m
      skills: newVolSkills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'AVAILABLE'
    };
    setVolunteers([newVol, ...volunteers]);
    setShowAddModal(false);
    setNewVolName('');
    setNewVolPhone('');
    setNewVolSkills('');
  };

  const handleDeleteVolunteer = (id: string) => {
    if (confirm("Are you sure you want to remove this volunteer?")) {
      setVolunteers(volunteers.filter(v => v.id !== id));
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🤝 Volunteer Coordination</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>NGO — Manage your volunteer workforce</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              ➕ Add Volunteer
            </button>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Available Volunteers', value: volunteers.length, color: '#22C55E', icon: '🤝' },
              { label: 'Open Requests', value: needs.length, color: '#F97316', icon: '🙋' },
              { label: 'Gap', value: Math.max(0, needs.length - volunteers.length), color: '#EF4444', icon: '⚠️' },
              { label: 'Coverage', value: volunteers.length >= needs.length ? '✅ Good' : '⚠️ Low', color: volunteers.length >= needs.length ? '#22C55E' : '#EF4444', icon: '📊' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#22C55E' }}>🤝 Volunteer Roster ({volunteers.length})</h3>
                {volunteers.length === 0 ? <p style={{ color: '#9CA3AF' }}>No volunteers nearby</p> : volunteers.map((v: any) => (
                  <div key={v.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{v.user_id?.length > 15 ? `Volunteer #${v.user_id.slice(0, 8)}` : v.user_id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {v.distance_m}m away · Skills: {(v.skills || []).join(', ') || 'General'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${v.status === 'AVAILABLE' ? 'badge-green' : 'badge-orange'}`}>{v.status}</span>
                      <button onClick={() => handleDeleteVolunteer(v.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }} title="Remove Volunteer">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', color: '#F97316' }}>🙋 Open Help Requests ({needs.length})</h3>
                {needs.length === 0 ? <p style={{ color: '#9CA3AF' }}>No open requests</p> : needs.map((n: any) => (
                  <div key={n.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.category}</span>
                      <span className={`badge ${n.urgency >= 8 ? 'badge-red' : n.urgency >= 5 ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                        Urgency {n.urgency}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{n.description || 'Help needed'} · {n.distance_m}m away</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Volunteer Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Add New Volunteer</h2>
              <form onSubmit={handleAddVolunteer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                  <input type="text" value={newVolName} onChange={e => setNewVolName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Anand Shinde" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                  <input type="text" value={newVolPhone} onChange={e => setNewVolPhone(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Skills (Comma Separated)</label>
                  <input type="text" value={newVolSkills} onChange={e => setNewVolSkills(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. First Aid, Local Guide" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Volunteer</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
