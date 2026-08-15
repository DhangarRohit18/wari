'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function NGOResourcesPage() {
  const [pred, setPred] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    setRefreshing(true);
    const data = await apiCall('/resources/prediction');
    setPred(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetch(); }, []);

  const RISK_COLOR: Record<string, string> = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📦 Resource Predictions</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>NGO — AI-based demand forecasting · <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>DEMO</span></p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetch} disabled={refreshing}>
            {refreshing ? '⏳' : '🔄 Refresh'}
          </button>
        </header>
        <div className="dashboard-content">
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 48, height: 48, margin: 'auto' }} /></div> : pred && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Est. Pilgrims', value: pred.total_pilgrims_estimate.toLocaleString(), color: '#6366F1', icon: '🙏' },
                  { label: 'Food Demand', value: `${(pred.food.demand_meals / 1000).toFixed(1)}K meals`, color: '#F97316', icon: '🍛' },
                  { label: 'Water Points', value: `${pred.water.available_points}/${pred.water.total_points}`, color: '#3B82F6', icon: '💧' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div><div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                      <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Food */}
              <div className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${RISK_COLOR[pred.food.shortage_risk]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3>🍛 Food / Annadan</h3>
                  <span style={{ fontWeight: 700, color: RISK_COLOR[pred.food.shortage_risk] }}>{pred.food.shortage_risk} RISK</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div><div style={{ color: '#6B7280', fontSize: '0.7rem' }}>DEMAND</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{(pred.food.demand_meals / 1000).toFixed(1)}K</div></div>
                  <div><div style={{ color: '#6B7280', fontSize: '0.7rem' }}>AVAILABLE</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{(pred.food.available_capacity / 1000).toFixed(1)}K</div></div>
                  <div><div style={{ color: '#6B7280', fontSize: '0.7rem' }}>SHORTAGE</div><div style={{ fontWeight: 800, fontSize: '1.5rem', color: pred.food.shortage_meals > 0 ? '#EF4444' : '#22C55E' }}>{pred.food.shortage_meals > 0 ? `${pred.food.shortage_meals.toLocaleString()}` : 'None'}</div></div>
                </div>
                <div style={{ background: `${RISK_COLOR[pred.food.shortage_risk]}10`, borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: RISK_COLOR[pred.food.shortage_risk], fontWeight: 600 }}>
                  💡 {pred.food.recommendation}
                </div>
              </div>

              {/* Water */}
              <div className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${RISK_COLOR[pred.water.shortage_risk]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3>💧 Water Supply</h3>
                  <span style={{ fontWeight: 700, color: RISK_COLOR[pred.water.shortage_risk] }}>{pred.water.shortage_risk} RISK</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                  <div className="progress-fill" style={{ width: `${(pred.water.available_points / pred.water.total_points) * 100}%`, background: RISK_COLOR[pred.water.shortage_risk] }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                  {pred.water.available_points} of {pred.water.total_points} points operational
                </div>
                <div style={{ background: `${RISK_COLOR[pred.water.shortage_risk]}10`, borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: RISK_COLOR[pred.water.shortage_risk], fontWeight: 600 }}>
                  💡 {pred.water.recommendation}
                </div>
              </div>

              {/* Medical */}
              <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>🏥 Medical Demand</h3>
                <div style={{ fontSize: '0.85rem', color: '#374151' }}>Estimated cases today: <strong style={{ color: '#8B5CF6', fontSize: '1.25rem' }}>{pred.medical.estimated_cases}</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem', fontStyle: 'italic' }}>💡 {pred.medical.recommendation}</div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.75rem' }}>Based on {pred.total_pilgrims_estimate.toLocaleString()} estimated pilgrims · DEMO DATA</div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
