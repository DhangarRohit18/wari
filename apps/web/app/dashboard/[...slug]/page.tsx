'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function GenericModulePage() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const role = segments[1] || 'module';
  const moduleName = segments[segments.length - 1] || 'Overview';
  
  // Format module name (e.g. 'sos' -> 'SOS', 'digital-twin' -> 'Digital Twin')
  const formattedName = moduleName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>✨ {formattedName} Module</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Advanced features for {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
          <span className="badge badge-blue">Enterprise Module</span>
        </header>
        
        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Active Tasks', value: '12', color: '#F97316', icon: '📋' },
              { label: 'System Health', value: '100%', color: '#22C55E', icon: '✅' },
              { label: 'Live Connections', value: '45', color: '#3B82F6', icon: '📡' },
              { label: 'Pending Updates', value: '3', color: '#F59E0B', icon: '⏳' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="stat-value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📊</span> Live Activity Stream
              </h3>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} style={{ padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Optimization #{item}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Automated resource allocation routine completed successfully.</div>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{item * 12} minutes ago</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
                <h3 style={{ marginBottom: '1rem', color: '#F8FAFC' }}>🚀 Module Configuration</h3>
                <p style={{ fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '1rem' }}>
                  This advanced feature module is currently operating in automated mode. Manual overrides are restricted during standard operation.
                </p>
                <button className="btn btn-primary btn-full">Access Settings (Admin Only)</button>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>📈 Performance Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Processing Speed', value: '98%', color: '#22C55E' },
                    { label: 'Data Accuracy', value: '99.9%', color: '#3B82F6' },
                    { label: 'Network Latency', value: '45ms', color: '#F59E0B' }
                  ].map((metric, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                        <span>{metric.label}</span>
                        <span>{metric.value}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: metric.value.replace('ms', '%'), background: metric.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
