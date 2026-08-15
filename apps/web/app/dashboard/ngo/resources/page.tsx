'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function NGOResourcesPage() {
  const [pred, setPred] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newAllocated, setNewAllocated] = useState(100);
  const [newRemaining, setNewRemaining] = useState(100);

  const fetch = async () => {
    setRefreshing(true);
    const [predData, invData] = await Promise.all([
      apiCall('/resources/prediction'),
      apiCall('/ngo/resources')
    ]);
    setPred(predData);
    setInventory(invData || []);
    setLoading(false);
    setRefreshing(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const ratio = newRemaining / newAllocated;
    const risk = ratio > 0.5 ? 'LOW' : ratio > 0.2 ? 'MEDIUM' : 'HIGH';
    const newItem = {
      id: `res${Date.now()}`,
      item_name: newItemName,
      allocated: newAllocated,
      remaining: newRemaining,
      risk_level: risk
    };
    setInventory([newItem, ...inventory]);
    setShowAddModal(false);
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this item?")) {
      setInventory(inventory.filter((i: any) => i.id !== id));
    }
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
              <div className="card" style={{ borderLeft: '4px solid #8B5CF6', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>🏥 Medical Demand</h3>
                <div style={{ fontSize: '0.85rem', color: '#374151' }}>Estimated cases today: <strong style={{ color: '#8B5CF6', fontSize: '1.25rem' }}>{pred.medical.estimated_cases}</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.5rem', fontStyle: 'italic' }}>💡 {pred.medical.recommendation}</div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.75rem' }}>Based on {pred.total_pilgrims_estimate.toLocaleString()} estimated pilgrims · DEMO DATA</div>
              </div>
              
              {/* Inventory Tracking CRUD */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📦 Inventory Management</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Add Item</button>
              </div>
              
              <div className="card">
                {inventory.length === 0 ? <p style={{ color: '#9CA3AF' }}>No inventory items.</p> : inventory.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.item_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Remaining: <strong>{item.remaining.toLocaleString()}</strong> / {item.allocated.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${item.risk_level === 'LOW' ? 'badge-green' : item.risk_level === 'MEDIUM' ? 'badge-yellow' : 'badge-red'}`}>{item.risk_level} RISK</span>
                      <button onClick={() => handleDeleteItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }} title="Remove Item">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Inventory Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Add Inventory Item</h2>
              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Item Name</label>
                  <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Paracetamol Boxes" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Total Allocated Quantity</label>
                  <input type="number" value={newAllocated} onChange={e => setNewAllocated(Number(e.target.value))} required min={1} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Currently Remaining</label>
                  <input type="number" value={newRemaining} onChange={e => setNewRemaining(Number(e.target.value))} required min={0} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Item</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
