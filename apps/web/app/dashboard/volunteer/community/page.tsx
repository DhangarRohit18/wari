'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const POST_TYPES = [
  { value: 'FOOD_AVAILABLE', icon: '🍛', label: 'Food Available', color: '#22C55E' },
  { value: 'WATER_AVAILABLE', icon: '💧', label: 'Water Available', color: '#3B82F6' },
  { value: 'MEDICAL_HELP', icon: '🏥', label: 'Medical Help', color: '#EF4444' },
  { value: 'ROUTE_WARNING', icon: '⚠️', label: 'Route Warning', color: '#F59E0B' },
  { value: 'WEATHER_WARNING', icon: '⛈️', label: 'Weather Warning', color: '#6366F1' },
  { value: 'LOST_PERSON', icon: '👤', label: 'Lost Person', color: '#EC4899' },
  { value: 'HELP_REQUEST', icon: '🤝', label: 'Help Request', color: '#F97316' },
  { value: 'GENERAL', icon: '📢', label: 'General', color: '#9CA3AF' },
];

const LAT = 17.6741, LON = 75.3279;

export default function VolunteerCommunityPage() {
  const token = getToken();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [showCreate, setShowCreate] = useState(false);
  const [postType, setPostType] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchPosts = async () => {
    try {
      const data = await apiCall(`/community/posts?lat=${LAT}&lon=${LON}&radius_km=${radius}`);
      setPosts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [radius]);

  const handlePost = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await apiCall('/community/posts', {
        method: 'POST',
        body: JSON.stringify({ post_type: postType, message, latitude: LAT, longitude: LON, radius_km: radius })
      }, token);
      setMessage('');
      setShowCreate(false);
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
    setSubmitting(false);
  };

  const upvote = async (id: string) => {
    await apiCall(`/community/posts/${id}/upvote`, { method: 'POST' });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
  };

  const getStyle = (type: string) => POST_TYPES.find(p => p.value === type) || { color: '#9CA3AF', icon: '📢' };

  const timeAgo = (dt: string) => {
    const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const filtered = filter === 'ALL' ? posts : posts.filter(p => p.post_type === filter);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📢 Community Feed</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Volunteer — post updates and interact with pilgrims</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Post Update</button>
            <span className="badge badge-blue">{posts.length} posts</span>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>📍 Radius:</span>
              {[1, 2, 5, 10].map(r => (
                <button key={r} className={`btn btn-sm ${radius === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRadius(r)}>{r}km</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('ALL')}>All</button>
              {POST_TYPES.map(t => (
                <button key={t.value} className={`btn btn-sm ${filter === t.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(t.value)}
                  style={{ borderColor: filter === t.value ? t.color : undefined, color: filter === t.value ? t.color : undefined }}>
                  {t.icon} {t.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No posts found. Be the first to share!</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowCreate(true)}>+ Create Post</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((post: any) => {
                const style = getStyle(post.post_type);
                return (
                  <div key={post.id} className="card card-sm" style={{ borderLeft: `4px solid ${style.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{style.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{post.author_name}</span>
                          {post.is_verified && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Verified</span>}
                          <span className="badge" style={{ background: `${style.color}20`, color: style.color, fontSize: '0.65rem' }}>
                            {post.post_type.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{post.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                          <span>📍 {post.distance_m}m away</span>
                          <button onClick={() => upvote(post.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            👍 {post.upvotes}
                          </button>
                          <span>Expires {Math.max(0, Math.floor((new Date(post.expires_at).getTime() - Date.now()) / 3600000))}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>📢 Post Community Update</h2>
              <div className="form-group">
                <label>Post Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {POST_TYPES.map(pt => (
                    <button key={pt.value} onClick={() => setPostType(pt.value)}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontSize: '0.7rem', textAlign: 'center',
                        borderColor: postType === pt.value ? pt.color : '#E5E7EB',
                        background: postType === pt.value ? `${pt.color}15` : 'white' }}>
                      <div>{pt.icon}</div>
                      <div style={{ fontWeight: 600 }}>{pt.label.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="input" placeholder="Share a verified update with nearby pilgrims..."
                  value={message} onChange={e => setMessage(e.target.value)} rows={4} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePost} disabled={submitting || !message.trim()}>
                  {submitting ? 'Posting...' : '📢 Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
