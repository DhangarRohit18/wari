'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const CAT_COLOR: Record<string, string> = {
  MEDICAL: '#EF4444', DEHYDRATION: '#3B82F6', FATIGUE: '#F59E0B',
  ACCIDENT: '#8B5CF6', LOST: '#EC4899', OTHER: '#9CA3AF',
};

export default function MedicalCasesPage() {
  const token = getToken();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    apiCall('/sos', {}, token).then(data => {
      setCases(data.filter((s: any) => s.status === 'RESOLVED'));
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.category === filter);
  const categories = ['ALL', ...Array.from(new Set(cases.map((c: any) => c.category)))];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📋 Case Records</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All resolved medical cases</p>
          </div>
          <span className="badge badge-green">{cases.length} total resolved</span>
        </header>
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Cases', value: cases.length, color: '#6366F1', icon: '📋' },
              { label: 'Medical', value: cases.filter(c => c.category === 'MEDICAL').length, color: '#EF4444', icon: '🏥' },
              { label: 'Dehydration', value: cases.filter(c => c.category === 'DEHYDRATION').length, color: '#3B82F6', icon: '💧' },
              { label: 'Offline SOS', value: cases.filter(c => c.is_offline).length, color: '#F59E0B', icon: '📡' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(c)}>
                {c} {c !== 'ALL' && `(${cases.filter(x => x.category === c).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((s: any) => (
                <div key={s.id} className="card" style={{ borderLeft: `4px solid ${CAT_COLOR[s.category] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: CAT_COLOR[s.category] }}>{s.category}</span>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✅ RESOLVED</span>
                        {s.is_offline && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>📡 Offline</span>}
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>
                          {new Date(s.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>{s.description || 'No description'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        📍 {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                        {s.blood_group && ` · 🩸 ${s.blood_group}`}
                        {s.responder_name && ` · Resolved by: ${s.responder_name}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'right' }}>
                      ID: {s.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>No resolved cases in this category</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
