'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

export default function CleanerToiletsPage() {
  const token = getToken();
  const [toilets, setToilets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState<string | null>(null);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('ALL');

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnits, setNewUnits] = useState(10);
  const [newGender, setNewGender] = useState('ALL');

  useEffect(() => {
    apiCall('/toilets').then(data => { setToilets(data); setLoading(false); });
  }, []);

  const handleAddToilet = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock = {
      id: `t${Date.now()}`,
      name: newName,
      total_units: newUnits,
      gender: newGender,
      status: 'CLEAN',
      minutes_since_cleaned: 0,
      rating: 5.0,
    };
    setToilets([newBlock, ...toilets]);
    setShowAddModal(false);
    setNewName('');
    setNewGender('ALL');
  };

  const handleDeleteToilet = (id: string) => {
    if (confirm("Remove this sanitation block?")) {
      setToilets(toilets.filter(t => t.id !== id));
    }
  };

  const markCleaned = async (toiletId: string) => {
    setCleaning(toiletId);
    try {
      await apiCall(`/toilets/${toiletId}/clean`, {
        method: 'POST',
        body: JSON.stringify({ issues: issues[toiletId] || null })
      }, token);
      setToilets(prev => prev.map(t => t.id === toiletId ? { ...t, status: 'CLEAN', minutes_since_cleaned: 0 } : t));
      setIssues(prev => ({ ...prev, [toiletId]: '' }));
    } catch (e: any) { alert(e.message); }
    setCleaning(null);
  };

  const statusColor: Record<string, string> = {
    CLEAN: '#22C55E', NEEDS_CLEANING: '#F59E0B', MAINTENANCE: '#EF4444', CLOSED: '#9CA3AF',
  };

  const filtered = filter === 'ALL' ? toilets : toilets.filter(t => t.status === filter);
  const priority = ['NEEDS_CLEANING', 'MAINTENANCE', 'CLEAN', 'CLOSED'];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🚻 My Assigned Toilets</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Prioritized by cleaning need</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-yellow">{toilets.filter(t => t.status === 'NEEDS_CLEANING').length} urgent</span>
            <span className="badge badge-green">{toilets.filter(t => t.status === 'CLEAN').length} clean</span>
          </div>
        </header>
        <div className="dashboard-content">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['ALL', 'NEEDS_CLEANING', 'CLEAN', 'MAINTENANCE'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}>
                {f.replace('_', ' ')} {f !== 'ALL' && `(${toilets.filter(t => t.status === f).length})`}
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {[...filtered].sort((a, b) => (priority.indexOf(a.status) - priority.indexOf(b.status))).map((t: any) => (
                <div key={t.id} className="card" style={{ borderLeft: `4px solid ${statusColor[t.status] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ marginBottom: '0.25rem' }}>{t.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.total_units} units · {t.gender}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: `${statusColor[t.status]}20`, color: statusColor[t.status] }}>{t.status}</span>
                      <button onClick={() => handleDeleteToilet(t.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.15rem' }} title="Remove Sanitation Block">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    🕐 Last cleaned: {t.minutes_since_cleaned !== null ? `${t.minutes_since_cleaned} min ago` : 'Unknown'}{' · '}
                    ⭐ {t.rating}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <input className="input" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
                      placeholder="Issue notes (optional)..."
                      value={issues[t.id] || ''}
                      onChange={e => setIssues(prev => ({ ...prev, [t.id]: e.target.value }))} />
                    <button className="btn btn-primary btn-sm"
                      onClick={() => markCleaned(t.id)}
                      disabled={cleaning === t.id}
                      style={{ background: t.status === 'CLEAN' ? '#22C55E' : '#F97316' }}>
                      {cleaning === t.id ? '⏳ Marking...' : t.status === 'CLEAN' ? '✅ Re-check Clean' : '🧹 Mark as Cleaned'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Toilet Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Add Sanitation Block</h2>
              <form onSubmit={handleAddToilet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Location Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="e.g. Wakhari Main Block A" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Total Units</label>
                    <input type="number" value={newUnits} onChange={e => setNewUnits(Number(e.target.value))} required min={1} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Gender</label>
                    <select value={newGender} onChange={e => setNewGender(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <option value="ALL">All (Unisex)</option>
                      <option value="MALE">Male Only</option>
                      <option value="FEMALE">Female Only</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Register Block</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
