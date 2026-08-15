'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, setAuth } from '@/lib/api';
import { useLanguage, Language } from '@/context/LanguageContext';

const DEMO_ROLES = [
  { role: 'VARKARI', email: 'varkari@wariverse.demo', icon: '🚩', nameKey: 'varkari', color: '#D97706' },
  { role: 'VOLUNTEER', email: 'volunteer@wariverse.demo', icon: '🤝', nameKey: 'volunteer', color: '#16A34A' },
  { role: 'MEDICAL_TEAM', email: 'medical@wariverse.demo', icon: '🏥', nameKey: 'medicalTeam', color: '#DC2626' },
  { role: 'POLICE', email: 'police@wariverse.demo', icon: '🚔', nameKey: 'police', color: '#2563EB' },
  { role: 'NGO', email: 'ngo@wariverse.demo', icon: '🌿', nameKey: 'ngo', color: '#7C3AED' },
  { role: 'SERVICE_PROVIDER', email: 'provider@wariverse.demo', icon: '🏪', nameKey: 'serviceProvider', color: '#0891B2' },
  { role: 'CLEANER', email: 'cleaner@wariverse.demo', icon: '🧹', nameKey: 'cleaner', color: '#CA8A04' },
  { role: 'ADMIN', email: 'admin@wariverse.demo', icon: '⚙️', nameKey: 'admin', color: '#4F46E5' },
];

const DEMO_PASSWORD = 'Demo@123';

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginEmail = overrideEmail || email;
      const loginPassword = overridePassword || password;
      const data = await loginUser(loginEmail, loginPassword);
      setAuth(data.access_token, {
        id: data.user_id,
        role: data.role,
        display_name: data.display_name,
        email: loginEmail,
      });

      const roleRoutes: Record<string, string> = {
        VARKARI: '/dashboard/varkari',
        VOLUNTEER: '/dashboard/volunteer',
        MEDICAL_TEAM: '/dashboard/medical',
        POLICE: '/dashboard/police',
        NGO: '/dashboard/ngo',
        SERVICE_PROVIDER: '/dashboard/provider',
        CLEANER: '/dashboard/cleaner',
        ADMIN: '/dashboard/admin',
      };
      router.push(roleRoutes[data.role] || '/dashboard/varkari');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setActiveRole(demoEmail);
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    await handleLogin(undefined, demoEmail, DEMO_PASSWORD);
    setActiveRole(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Top Header & Language Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #D97706, #B45309)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🚩</div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{t('appName')}</h1>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{t('appSubtitle')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>🌐 {t('language')}:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer', outline: 'none' }}
            >
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Sign In Form */}
          <div className="card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>Sign In</h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Enter your authorized credentials to access the platform
            </p>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.65rem 0.875rem', borderRadius: 8, marginBottom: '1.15rem', fontSize: '0.825rem', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="name@wariverse.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '0.75rem', fontSize: '0.925rem' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', fontSize: '0.775rem', color: '#64748B', textAlign: 'center' }}>
              🔑 Default Demo Password: <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, color: '#0F172A', fontWeight: 700 }}>Demo@123</code>
            </div>
          </div>

          {/* Quick Demo Access Grid */}
          <div className="card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>Quick Access Portal</h3>
            <p style={{ color: '#64748B', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              Select a stakeholder role to inspect the live dashboard
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {DEMO_ROLES.map(({ role, email: roleEmail, icon, nameKey, color }) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(roleEmail)}
                  disabled={loading}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    borderLeft: `4px solid ${color}`,
                    background: activeRole === roleEmail ? '#FEF3C7' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%' }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0F172A' }}>
                      {activeRole === roleEmail ? '⏳ Logging in...' : t(nameKey)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                    {roleEmail}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', background: '#F8FAFC', borderRadius: 8, padding: '0.875rem', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700, marginBottom: '0.35rem' }}>💡 Demonstration Flow:</div>
              <ul style={{ fontSize: '0.75rem', color: '#475569', paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>Login as <strong>Varkari</strong> → view services & test Smart SOS</li>
                <li>Login as <strong>Admin</strong> → inspect Live Digital Twin map</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#64748B', fontSize: '0.775rem' }}>
          <p style={{ fontWeight: 600 }}>{t('devotionalGreeting')} — Pandharpur Wari Platform</p>
        </div>

      </div>
    </div>
  );
}
