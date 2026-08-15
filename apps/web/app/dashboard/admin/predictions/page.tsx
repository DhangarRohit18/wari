'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function AIPredictionsPage() {
  const [crowdPred, setCrowdPred] = useState<any>(null);
  const [resourcePred, setResourcePred] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPredictions = async () => {
    setRefreshing(true);
    const [cp, rp] = await Promise.all([apiCall('/crowd/prediction'), apiCall('/resources/prediction')]);
    setCrowdPred(cp);
    setResourcePred(rp);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchPredictions(); }, []);

  const LEVEL_COLOR: Record<string, string> = { GREEN: '#22C55E', YELLOW: '#EAB308', ORANGE: '#F97316', RED: '#EF4444' };
  const RISK_COLOR: Record<string, string> = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900 }}>🤖 AI Predictions</h1>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Crowd & Resource Intelligence · <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>DEMO MODE</span>
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchPredictions} disabled={refreshing}>
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </header>

        <div className="dashboard-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 48, height: 48, margin: 'auto' }} /></div>
          ) : (
            <>
              {/* Crowd Predictions */}
              <h3 style={{ marginBottom: '1rem' }}>🚦 Crowd Density Predictions (30-minute horizon)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {crowdPred?.predictions?.map((p: any) => (
                  <div key={p.zone_id} className="card" style={{ borderTop: `3px solid ${LEVEL_COLOR[p.predicted_level] || '#9CA3AF'}` }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.zone_name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>NOW</div>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: LEVEL_COLOR[p.current_level] }}>{(p.current_density * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: '0.7rem', color: LEVEL_COLOR[p.current_level] }}>{p.current_level}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>+30 MIN</div>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: LEVEL_COLOR[p.predicted_level] }}>{(p.predicted_density_30min * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: '0.7rem', color: LEVEL_COLOR[p.predicted_level] }}>{p.predicted_level}</div>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                      <div className="progress-fill" style={{ width: `${p.predicted_density_30min * 100}%`, background: LEVEL_COLOR[p.predicted_level] }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: RISK_COLOR[p.risk_level] }}>
                        {p.risk_level} RISK · {(p.confidence * 100).toFixed(0)}% confidence
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{p.estimated_count?.toLocaleString()} people</span>
                    </div>
                    {p.recommendation && (
                      <div style={{ marginTop: '0.5rem', background: `${RISK_COLOR[p.risk_level]}10`, borderRadius: 8, padding: '0.5rem', fontSize: '0.75rem', color: RISK_COLOR[p.risk_level], fontWeight: 500 }}>
                        💡 {p.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Resource Predictions */}
              <h3 style={{ marginBottom: '1rem' }}>📦 Resource Demand Predictions</h3>
              {resourcePred && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {/* Food */}
                  <div className="card" style={{ borderTop: `3px solid ${RISK_COLOR[resourcePred.food.shortage_risk]}` }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍛</div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Food / Annadan</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <div><div style={{ color: '#6B7280', fontSize: '0.7rem' }}>DEMAND</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{(resourcePred.food.demand_meals / 1000).toFixed(1)}K</div></div>
                      <div><div style={{ color: '#6B7280', fontSize: '0.7rem' }}>CAPACITY</div><div style={{ fontWeight: 800, fontSize: '1.5rem' }}>{(resourcePred.food.available_capacity / 1000).toFixed(1)}K</div></div>
                    </div>
                    <div style={{ padding: '0.75rem', background: `${RISK_COLOR[resourcePred.food.shortage_risk]}10`, borderRadius: 10, marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: RISK_COLOR[resourcePred.food.shortage_risk] }}>{resourcePred.food.shortage_risk} RISK</div>
                      {resourcePred.food.shortage_meals > 0 && <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Shortage: {resourcePred.food.shortage_meals.toLocaleString()} meals</div>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#374151', fontStyle: 'italic' }}>💡 {resourcePred.food.recommendation}</div>
                  </div>

                  {/* Water */}
                  <div className="card" style={{ borderTop: `3px solid ${RISK_COLOR[resourcePred.water.shortage_risk]}` }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Water Supply</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#6B7280', fontSize: '0.7rem', marginBottom: '0.25rem' }}>POINTS AVAILABLE</div>
                      <div style={{ fontWeight: 800, fontSize: '2rem' }}>{resourcePred.water.available_points}<span style={{ fontSize: '1rem', color: '#9CA3AF' }}>/{resourcePred.water.total_points}</span></div>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                      <div className="progress-fill" style={{ width: `${(resourcePred.water.available_points / resourcePred.water.total_points) * 100}%`, background: RISK_COLOR[resourcePred.water.shortage_risk] }} />
                    </div>
                    <div style={{ padding: '0.75rem', background: `${RISK_COLOR[resourcePred.water.shortage_risk]}10`, borderRadius: 10, marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: RISK_COLOR[resourcePred.water.shortage_risk] }}>{resourcePred.water.shortage_risk} RISK</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#374151', fontStyle: 'italic' }}>💡 {resourcePred.water.recommendation}</div>
                  </div>

                  {/* Medical */}
                  <div className="card" style={{ borderTop: '3px solid #8B5CF6' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏥</div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Medical Cases</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#6B7280', fontSize: '0.7rem', marginBottom: '0.25rem' }}>ESTIMATED CASES TODAY</div>
                      <div style={{ fontWeight: 800, fontSize: '2rem', color: '#8B5CF6' }}>{resourcePred.medical.estimated_cases}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#374151', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      💡 {resourcePred.medical.recommendation}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#9CA3AF' }}>
                      Based on {resourcePred.total_pilgrims_estimate.toLocaleString()} estimated pilgrims
                    </div>
                  </div>
                </div>
              )}

              <div className="card" style={{ background: '#0F172A', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#FB923C', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ DEMO PREDICTION NOTICE</div>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                  These predictions use deterministic demo algorithms for hackathon demonstration. 
                  In production, real ML models trained on historical Wari crowd data would be used.
                  Model: DEMO_PREDICTION_v1 · Confidence: 78% (simulated)
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
