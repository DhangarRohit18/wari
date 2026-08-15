'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

const CATEGORIES = ['FOOD', 'WATER', 'MEDICINE', 'SHELTER', 'WHEELCHAIR', 'CHARGER', 'UMBRELLA', 'VOLUNTEER', 'MEDICAL', 'TRANSPORT'];

export default function VolunteerHelpPage() {
  const token = getToken();
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOffer, setShowOffer] = useState(false);
  const [offerCategory, setOfferCategory] = useState('FOOD');
  const [offerDesc, setOfferDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    apiCall(`/help/needs?lat=${LAT}&lon=${LON}`).then(d => { setNeeds(d); setLoading(false); });
  }, []);

  const submitOffer = async () => {
    setSubmitting(true);
    try {
      await apiCall('/help/offers', {
        method: 'POST',
        body: JSON.stringify({ category: offerCategory, description: offerDesc, latitude: LAT, longitude: LON })
      }, token);
      setSuccessMsg(`✅ Offer posted for "${offerCategory}" — you will be matched when a request comes in`);
      setShowOffer(false);
      setOfferDesc('');
    } catch (e: any) { alert(e.message); }
    setSubmitting(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🤝 Help Matching</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Volunteer — view open requests and offer your help</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowOffer(true)}>+ Offer Help</button>
            <span className="badge badge-orange">{needs.length} open requests</span>
          </div>
        </header>
        <div className="dashboard-content">
          {successMsg && (
            <div style={{ background: '#DCFCE7', border: '2px solid #22C55E', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#15803D', fontWeight: 600 }}>{successMsg}</div>
              <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>
          )}

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Open Requests', value: needs.length, color: '#F97316', icon: '🙋' },
              { label: 'Urgent (8+)', value: needs.filter(n => n.urgency >= 8).length, color: '#EF4444', icon: '🆘' },
              { label: 'Food/Water', value: needs.filter(n => ['FOOD', 'WATER'].includes(n.category)).length, color: '#3B82F6', icon: '🍛' },
              { label: 'Medical', value: needs.filter(n => n.category === 'MEDICAL').length, color: '#8B5CF6', icon: '🏥' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...needs].sort((a, b) => b.urgency - a.urgency).map((n: any) => (
                <div key={n.id} className="card"
                  style={{ borderLeft: `4px solid ${n.urgency >= 8 ? '#EF4444' : n.urgency >= 5 ? '#F59E0B' : '#22C55E'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{n.category}</span>
                        <span className={`badge ${n.urgency >= 8 ? 'badge-red' : n.urgency >= 5 ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                          Urgency {n.urgency}/10
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>
                          {new Date(n.created_at || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>{n.description || 'Help needed'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>📍 {n.distance_m}m away</div>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem', flexShrink: 0 }}
                      onClick={() => setShowOffer(true)}>
                      🤝 Help
                    </button>
                  </div>
                </div>
              ))}
              {needs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
                  <p>No open help requests right now. Great work!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showOffer && (
          <div className="modal-overlay" onClick={() => setShowOffer(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '0.5rem' }}>🤝 Offer Help</h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Tell us what you can offer — we'll match you with someone in need
              </p>
              <div className="form-group">
                <label>What can you offer?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setOfferCategory(cat)}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center',
                        borderColor: offerCategory === cat ? '#22C55E' : '#E5E7EB',
                        background: offerCategory === cat ? '#DCFCE7' : 'white' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Details (optional)</label>
                <textarea className="input" placeholder="e.g., I have 5 bottles of water..." value={offerDesc}
                  onChange={e => setOfferDesc(e.target.value)} rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowOffer(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitOffer} disabled={submitting}>
                  {submitting ? '⏳ Posting...' : '🤝 Offer Help'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
