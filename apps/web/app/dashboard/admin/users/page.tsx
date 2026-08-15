'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#6366F1', VARKARI: '#F97316', VOLUNTEER: '#22C55E',
  MEDICAL_TEAM: '#EF4444', POLICE: '#3B82F6', NGO: '#8B5CF6',
  SERVICE_PROVIDER: '#06B6D4', CLEANER: '#F59E0B',
};

export default function AdminUsersPage() {
  const token = getToken();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // CRUD States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('VARKARI');

  useEffect(() => {
    apiCall('/admin/users', {}, token).then(data => { setUsers(data); setLoading(false); });
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `u${Date.now()}`,
      email: newEmail,
      role: newRole,
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setUsers([newUser, ...users]);
    setShowAddModal(false);
    setNewEmail('');
    setNewRole('VARKARI');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Delete this user permanently?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const roles = ['ALL', ...Array.from(new Set(users.map(u => u.role)))];
  const filtered = users.filter(u => {
    const matchRole = filter === 'ALL' || u.role === filter;
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👥 User Management</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>All registered WariVerse users</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge badge-blue">{users.length} total users</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Create User</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total', value: users.length, color: '#6366F1', icon: '👥' },
              { label: 'Varkaris', value: users.filter(u => u.role === 'VARKARI').length, color: '#F97316', icon: '🙏' },
              { label: 'Volunteers', value: users.filter(u => u.role === 'VOLUNTEER').length, color: '#22C55E', icon: '🤝' },
              { label: 'Verified', value: users.filter(u => u.is_verified).length, color: '#3B82F6', icon: '✅' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input className="input" placeholder="🔍 Search by email..." style={{ flex: 1, minWidth: 200 }}
              value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {roles.map(r => (
                <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(r)}
                  style={{ borderColor: filter === r ? ROLE_COLORS[r] : undefined, color: filter === r ? ROLE_COLORS[r] : undefined }}>
                  {r === 'ALL' ? 'All' : r.replace('_', ' ')} {r !== 'ALL' && `(${users.filter(u => u.role === r).length})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    {['Email', 'Role', 'Verified', 'Active', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className="badge" style={{ background: `${ROLE_COLORS[u.role] || '#9CA3AF'}20`, color: ROLE_COLORS[u.role] || '#9CA3AF', fontSize: '0.65rem' }}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`badge ${u.is_verified ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                          {u.is_verified ? '✅' : '⏳'} {u.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                          {u.is_active ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }} title="Delete User">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No users found</div>
              )}
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right' }}>
                Showing {filtered.length} of {users.length} users
              </div>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Create New User</h2>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }} placeholder="user@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Assign Role</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    {Object.keys(ROLE_COLORS).map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create User</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
