'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const LAT = 17.6741, LON = 75.3279;

export default function FoodPage() {
  const token = getToken();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      const [data, rec] = await Promise.all([
        apiCall(`/food/nearby?lat=${LAT}&lon=${LON}&radius_km=10`),
        apiCall('/ai/recommend-food', { method: 'POST', body: JSON.stringify({ lat: LAT, lon: LON }) }),
      ]);
      setItems(data);
      setRecommendation(rec);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = filter === 'ALL' ? items : items.filter(i => i.available_now === (filter === 'OPEN'));

  const getMealColor = (types: string[]) => {
    if (types?.includes('LUNCH')) return '#F97316';
    if (types?.includes('BREAKFAST')) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🍛 Food / Annadan</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>अन्नदान केंद्रे — Free meals for all Varkaris</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'OPEN', 'CLOSED'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </header>

        <div className="dashboard-content">
          {/* AI Recommendation */}
          {recommendation?.recommendations?.[0] && (
            <div className="prediction-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <span>🤖</span>
                <span style={{ color: 'white', fontWeight: 700 }}>AI Best Recommendation</span>
                <span className="prediction-badge">DEMO AI</span>
              </div>
              <div style={{ color: '#FED7AA', fontSize: '0.875rem' }}>{recommendation.explanation}</div>
              {recommendation.recommendations.slice(0, 3).map((r: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>#{i + 1} {r.name}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{r.distance_m}m · {r.walk_minutes} min walk · Queue: {r.estimated_queue_minutes} min</div>
                  </div>
                  <div style={{ color: '#FB923C', fontWeight: 800, fontSize: '0.875rem' }}>Score: {r.ai_score}</div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filtered.map((fc: any) => (
                <div key={fc.id} className="card" style={{ borderTop: `3px solid ${getMealColor(fc.meal_types)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{fc.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{fc.provider}</div>
                    </div>
                    <span className={`badge ${fc.available_now ? 'badge-green' : 'badge-red'}`}>
                      {fc.available_now ? '✓ OPEN' : '✗ CLOSED'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <div><div style={{ color: '#6B7280' }}>Distance</div><div style={{ fontWeight: 700 }}>{fc.distance_m}m · {fc.walk_minutes} min</div></div>
                    <div><div style={{ color: '#6B7280' }}>Queue</div><div style={{ fontWeight: 700, color: fc.estimated_queue_minutes > 15 ? '#EF4444' : '#22C55E' }}>{fc.estimated_queue_minutes} min</div></div>
                    <div><div style={{ color: '#6B7280' }}>Capacity</div><div style={{ fontWeight: 700 }}>{fc.capacity.toLocaleString()}</div></div>
                    <div><div style={{ color: '#6B7280' }}>Hygiene</div><div style={{ fontWeight: 700 }}>⭐ {fc.hygiene_rating}</div></div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    {(fc.meal_types || []).map((meal: string) => (
                      <span key={meal} className="badge badge-orange" style={{ marginRight: '0.25rem', fontSize: '0.65rem' }}>{meal}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    🕐 {fc.opening_time} – {fc.closing_time}
                  </div>
                  <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="progress-fill" style={{ width: `${(fc.current_count / fc.capacity) * 100}%`, background: getMealColor(fc.meal_types) }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                    {fc.current_count}/{fc.capacity} served
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
