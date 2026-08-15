'use client';
import { useState, useEffect } from 'react';
import { apiCall, getToken, getUser } from '@/lib/api';
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

const RADIUS_OPTIONS = [
  { value: 0.5, label: '500m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
];

export default function WariConnectPage() {
  const token = getToken();
  const user = getUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(2);
  const [showCreate, setShowCreate] = useState(false);
  const [postType, setPostType] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showNeedOffer, setShowNeedOffer] = useState(false);
  const [needCategory, setNeedCategory] = useState('WATER');
  const [needDescription, setNeedDescription] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [acceptedMatch, setAcceptedMatch] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const LAT = 17.6741, LON = 75.3279;

  const fetchPosts = async () => {
    try {
      const data = await apiCall(`/community/posts?lat=${LAT}&lon=${LON}&radius_km=${radius}`);
      setPosts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [radius]);

  const handleCreatePost = async () => {
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
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      await apiCall(`/community/posts/${postId}/upvote`, { method: 'POST' });
      await fetchPosts();
    } catch {}
  };

  const handleNeedSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiCall('/help/needs', {
        method: 'POST',
        body: JSON.stringify({ category: needCategory, description: needDescription, latitude: LAT, longitude: LON, urgency: 7 })
      }, token);
      setMatch(data.match);
      setShowNeedOffer(false);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const acceptMatch = async () => {
    if (!match?.need_id) { setAcceptedMatch(true); setMatch(null); return; }
    setAccepting(true);
    try {
      await apiCall(`/help/needs/${match.need_id}/accept`, { method: 'POST' }, token);
      setAcceptedMatch(true);
      setMatch(null);
    } catch (e: any) { alert('Could not accept match: ' + e.message); }
    setAccepting(false);
  };

  const getPostStyle = (type: string) => {
    const pt = POST_TYPES.find(p => p.value === type);
    return pt ? { borderLeftColor: pt.color, icon: pt.icon } : { borderLeftColor: '#9CA3AF', icon: '📢' };
  };

  const timeAgo = (dt: string) => {
    const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const HELP_CATEGORIES = ['FOOD', 'WATER', 'MEDICINE', 'SHELTER', 'WHEELCHAIR', 'CHARGER', 'UMBRELLA', 'VOLUNTEER', 'MEDICAL', 'TRANSPORT'];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👥 Wari Connect</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>वारी कनेक्ट — Location-based pilgrim community</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowNeedOffer(true)}>🤝 Need/Offer</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Post</button>
          </div>
        </header>

        <div className="dashboard-content">
          {acceptedMatch && (
            <div style={{ background: '#DCFCE7', border: '2px solid #22C55E', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#15803D' }}>✅ Match accepted! Head to the provider location.</div>
              <button onClick={() => setAcceptedMatch(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
          )}

          {/* Match found banner */}
          {match && (
            <div style={{ background: '#DCFCE7', border: '2px solid #22C55E', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#15803D', fontSize: '1rem', marginBottom: '0.5rem' }}>
                🎯 MATCH FOUND!
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>DISTANCE</div><div style={{ fontWeight: 700 }}>{match.distance_m}m</div></div>
                <div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>WALK TIME</div><div style={{ fontWeight: 700 }}>~{match.walk_minutes} min</div></div>
                <div><div style={{ fontSize: '0.7rem', color: '#6B7280' }}>PROVIDER</div><div style={{ fontWeight: 700 }}>{match.provider_name}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={acceptMatch} disabled={accepting}>
                  {accepting ? '⏳ Accepting...' : '✓ Accept Match'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setMatch(null)}>Dismiss</button>
              </div>
            </div>
          )}

          {/* Radius Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>📍 Radius:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {RADIUS_OPTIONS.map(r => (
                <button key={r.value} className={`btn btn-sm ${radius === r.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRadius(r.value)}>
                  {r.label}
                </button>
              ))}
            </div>
            <span className="badge badge-blue">{posts.length} posts</span>
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: 40, height: 40, margin: 'auto' }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No posts in this area yet. Be the first to share!</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowCreate(true)}>
                + Create First Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts.map((post: any) => {
                const style = getPostStyle(post.post_type);
                return (
                  <div key={post.id} className="card card-sm" style={{ borderLeft: `4px solid ${style.borderLeftColor}`, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{style.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{post.author_name}</span>
                          {post.is_verified && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Verified</span>}
                          <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{post.post_type.replace('_', ' ')}</span>
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{post.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>📍 {post.distance_m}m away</span>
                          <button
                            onClick={() => handleUpvote(post.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            👍 {post.upvotes}
                          </button>
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                            Expires in {Math.max(0, Math.floor((new Date(post.expires_at).getTime() - Date.now()) / 3600000))}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>Create Post</h2>
              <div className="form-group">
                <label>Post Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {POST_TYPES.map(pt => (
                    <button key={pt.value} onClick={() => setPostType(pt.value)}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '2px solid', borderColor: postType === pt.value ? pt.color : '#E5E7EB',
                        background: postType === pt.value ? `${pt.color}15` : 'white', cursor: 'pointer', fontSize: '0.75rem', textAlign: 'center' }}>
                      <div>{pt.icon}</div>
                      <div style={{ fontWeight: 600 }}>{pt.label.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Message (Marathi / Hindi / English)</label>
                <textarea className="input" placeholder="Share information with nearby pilgrims..." value={message}
                  onChange={e => setMessage(e.target.value)} rows={4} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreatePost} disabled={submitting || !message.trim()}>
                  {submitting ? 'Posting...' : '📢 Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Need/Offer Modal */}
        {showNeedOffer && (
          <div className="modal-overlay" onClick={() => setShowNeedOffer(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '0.5rem' }}>🤝 AI Need & Offer Exchange</h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                AI will find the nearest matching volunteer
              </p>
              <div className="form-group">
                <label>What do you need?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {HELP_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setNeedCategory(cat)}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '2px solid',
                        borderColor: needCategory === cat ? '#F97316' : '#E5E7EB',
                        background: needCategory === cat ? '#FFEDD5' : 'white',
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea className="input" placeholder="Any specific requirement..." value={needDescription}
                  onChange={e => setNeedDescription(e.target.value)} rows={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowNeedOffer(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleNeedSubmit} disabled={submitting}>
                  {submitting ? '🤖 Finding match...' : '🎯 Find Match'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
