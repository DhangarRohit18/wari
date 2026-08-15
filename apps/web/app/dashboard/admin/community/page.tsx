'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const POST_TYPE_COLORS: Record<string, string> = {
  FOOD_AVAILABLE: '#22C55E', WATER_AVAILABLE: '#3B82F6', MEDICAL_HELP: '#EF4444',
  ROUTE_WARNING: '#F59E0B', WEATHER_WARNING: '#6366F1', LOST_PERSON: '#EC4899',
  HELP_REQUEST: '#F97316', GENERAL: '#9CA3AF',
};

export default function AdminCommunityPage() {
  const token = getToken();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    const data = await apiCall('/community/posts?lat=17.6741&lon=75.3279&radius_km=100');
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    setDeleting(postId);
    try {
      await apiCall(`/community/posts/${postId}`, { method: 'DELETE' }, token);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e: any) { alert(e.message); }
    setDeleting(null);
  };

  const upvotePost = async (postId: string) => {
    await apiCall(`/community/posts/${postId}/upvote`, { method: 'POST' });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
  };

  const postTypes = ['ALL', ...Array.from(new Set(posts.map(p => p.post_type)))];
  const filtered = filter === 'ALL' ? posts : posts.filter(p => p.post_type === filter);

  const timeAgo = (dt: string) => {
    const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📢 Community Moderation</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Wari Connect — All community posts</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-blue">{posts.length} total posts</span>
            <span className="badge badge-orange">{posts.filter(p => !p.is_verified).length} unverified</span>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Posts', value: posts.length, color: '#6366F1', icon: '📢' },
              { label: 'Verified', value: posts.filter(p => p.is_verified).length, color: '#22C55E', icon: '✅' },
              { label: 'Warnings', value: posts.filter(p => ['ROUTE_WARNING', 'WEATHER_WARNING'].includes(p.post_type)).length, color: '#F59E0B', icon: '⚠️' },
              { label: 'Medical', value: posts.filter(p => p.post_type === 'MEDICAL_HELP').length, color: '#EF4444', icon: '🏥' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                  <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {postTypes.map(t => (
              <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(t)}>
                {t === 'ALL' ? 'All' : t.replace(/_/g, ' ')} {t !== 'ALL' && `(${posts.filter(p => p.post_type === t).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((post: any) => (
                <div key={post.id} className="card" style={{ borderLeft: `4px solid ${POST_TYPE_COLORS[post.post_type] || '#9CA3AF'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{post.author_name}</span>
                        {post.is_verified && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Verified</span>}
                        <span className="badge" style={{ background: `${POST_TYPE_COLORS[post.post_type]}20`, color: POST_TYPE_COLORS[post.post_type], fontSize: '0.65rem' }}>
                          {post.post_type.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{post.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                        <span>📍 {post.distance_m}m from center</span>
                        <span>👍 {post.upvotes} upvotes</span>
                        <span>📡 {post.radius_km}km radius</span>
                        <span>⏱️ ID: {post.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => upvotePost(post.id)}>👍</button>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#EF4444', color: 'white' }}
                        onClick={() => deletePost(post.id)}
                        disabled={deleting === post.id}
                      >
                        {deleting === post.id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>No posts found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
