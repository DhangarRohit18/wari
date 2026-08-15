'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearAuth, getUser } from '@/lib/api';
import { useLanguage, Language } from '@/context/LanguageContext';

type NavItemKey = { icon: string; key: string; path: string };

const ROLE_NAV: Record<string, NavItemKey[]> = {
  VARKARI: [
    { icon: '🏠', key: 'home', path: '/dashboard/varkari' },
    { icon: '🗺️', key: 'map', path: '/dashboard/varkari/map' },
    { icon: '🆘', key: 'smartSos', path: '/dashboard/varkari/sos' },
    { icon: '👥', key: 'wariConnect', path: '/dashboard/varkari/connect' },
    { icon: '🍛', key: 'food', path: '/dashboard/varkari/food' },
    { icon: '💧', key: 'water', path: '/dashboard/varkari/water' },
    { icon: '🏥', key: 'medical', path: '/dashboard/varkari/medical' },
    { icon: '🏠', key: 'shelter', path: '/dashboard/varkari/shelter' },
    { icon: '🚻', key: 'toilets', path: '/dashboard/varkari/toilets' },
    { icon: '🌿', key: 'wellness', path: '/dashboard/varkari/wellness' },
    { icon: '👤', key: 'lostFound', path: '/dashboard/varkari/lost' },
    { icon: '🔔', key: 'alerts', path: '/dashboard/varkari/alerts' },
  ],
  VOLUNTEER: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/volunteer' },
    { icon: '🆘', key: 'sosIncidents', path: '/dashboard/volunteer/sos' },
    { icon: '🤝', key: 'helpRequests', path: '/dashboard/volunteer/help' },
    { icon: '👤', key: 'lostPersons', path: '/dashboard/volunteer/lost' },
    { icon: '👥', key: 'community', path: '/dashboard/volunteer/community' },
    { icon: '📊', key: 'crowdReports', path: '/dashboard/volunteer/crowd' },
  ],
  MEDICAL_TEAM: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/medical' },
    { icon: '🆘', key: 'emergencyQueue', path: '/dashboard/medical/queue' },
    { icon: '🏥', key: 'camps', path: '/dashboard/medical/camps' },
    { icon: '🚑', key: 'ambulance', path: '/dashboard/medical/ambulance' },
    { icon: '📋', key: 'cases', path: '/dashboard/medical/cases' },
  ],
  POLICE: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/police' },
    { icon: '🆘', key: 'sosIncidents', path: '/dashboard/police/sos' },
    { icon: '👤', key: 'lostPersons', path: '/dashboard/police/missing' },
    { icon: '🚦', key: 'crowdAlerts', path: '/dashboard/police/crowd' },
    { icon: '⚠️', key: 'routeAlerts', path: '/dashboard/police/routes' },
  ],
  NGO: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/ngo' },
    { icon: '🍛', key: 'foodDist', path: '/dashboard/ngo/food' },
    { icon: '💧', key: 'waterDist', path: '/dashboard/ngo/water' },
    { icon: '🏠', key: 'shelter', path: '/dashboard/ngo/shelters' },
    { icon: '🤝', key: 'volunteers', path: '/dashboard/ngo/volunteers' },
    { icon: '📦', key: 'resources', path: '/dashboard/ngo/resources' },
  ],
  SERVICE_PROVIDER: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/provider' },
    { icon: '🍛', key: 'food', path: '/dashboard/provider/food' },
    { icon: '💧', key: 'water', path: '/dashboard/provider/water' },
    { icon: '🏠', key: 'shelter', path: '/dashboard/provider/shelter' },
    { icon: '⚡', key: 'charging', path: '/dashboard/provider/charging' },
    { icon: '🌿', key: 'wellness', path: '/dashboard/provider/wellness' },
  ],
  CLEANER: [
    { icon: '🏠', key: 'dashboard', path: '/dashboard/cleaner' },
    { icon: '🚻', key: 'toilets', path: '/dashboard/cleaner/toilets' },
    { icon: '📋', key: 'cleaningLog', path: '/dashboard/cleaner/log' },
    { icon: '⚠️', key: 'issues', path: '/dashboard/cleaner/issues' },
  ],
  ADMIN: [
    { icon: '🏠', key: 'commandCenter', path: '/dashboard/admin' },
    { icon: '🗺️', key: 'digitalTwin', path: '/dashboard/admin/digital-twin' },
    { icon: '🆘', key: 'sosIncidents', path: '/dashboard/admin/sos' },
    { icon: '📊', key: 'analytics', path: '/dashboard/admin/analytics' },
    { icon: '🤖', key: 'aiPredictions', path: '/dashboard/admin/predictions' },
    { icon: '👥', key: 'users', path: '/dashboard/admin/users' },
    { icon: '🍛', key: 'food', path: '/dashboard/admin/food' },
    { icon: '💧', key: 'water', path: '/dashboard/admin/water' },
    { icon: '🚻', key: 'toilets', path: '/dashboard/admin/toilets' },
    { icon: '👤', key: 'lostPersons', path: '/dashboard/admin/lost' },
    { icon: '🎮', key: 'demoControl', path: '/dashboard/admin/demo' },
    { icon: '📢', key: 'community', path: '/dashboard/admin/community' },
  ],
};

const ROLE_COLORS: Record<string, string> = {
  VARKARI: '#D97706', // Saffron / Gold
  VOLUNTEER: '#16A34A',
  MEDICAL_TEAM: '#DC2626',
  POLICE: '#2563EB',
  NGO: '#7C3AED',
  SERVICE_PROVIDER: '#0891B2',
  CLEANER: '#CA8A04',
  ADMIN: '#4F46E5',
};

const ROLE_ICONS: Record<string, string> = {
  VARKARI: '🚩',
  VOLUNTEER: '🤝',
  MEDICAL_TEAM: '🏥',
  POLICE: '🚔',
  NGO: '🌿',
  SERVICE_PROVIDER: '🏪',
  CLEANER: '🧹',
  ADMIN: '⚙️',
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setMounted(true);
  }, []);

  const role = (mounted ? user?.role : 'VARKARI') || 'VARKARI';
  const displayName = mounted ? (user?.display_name || 'User') : 'User';
  const navItems = ROLE_NAV[role] || ROLE_NAV.VARKARI;
  const roleColor = ROLE_COLORS[role] || '#D97706';

  const roleKeyMap: Record<string, string> = {
    VARKARI: 'varkari',
    VOLUNTEER: 'volunteer',
    MEDICAL_TEAM: 'medicalTeam',
    POLICE: 'police',
    NGO: 'ngo',
    SERVICE_PROVIDER: 'serviceProvider',
    CLEANER: 'cleaner',
    ADMIN: 'admin',
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      {/* Devotional / Professional Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚩</div>
        <div>
          <div className="sidebar-logo-text">{t('appName')}</div>
          <div className="sidebar-logo-sub">{t('appSubtitle')}</div>
        </div>
      </div>

      {/* Language Switcher Dropdown */}
      <div style={{ padding: '0.625rem 1rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>🌐 {t('language')}:</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 600, background: 'white', cursor: 'pointer' }}
        >
          <option value="mr">मराठी</option>
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* User Info */}
      <div style={{ padding: '0.75rem 1rem', background: `${roleColor}0D`, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: roleColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
          {ROLE_ICONS[role]}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2, color: '#1E293B' }}>{displayName}</div>
          <div style={{ fontSize: '0.7rem', color: roleColor, fontWeight: 600 }}>{t(roleKeyMap[role] || 'varkari')}</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
              style={{
                borderColor: isActive ? roleColor : 'transparent',
                color: isActive ? roleColor : '#475569',
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span style={{ fontWeight: isActive ? 700 : 500 }}>{t(item.key)}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          {t('devotionalGreeting')}
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout} style={{ border: '1px solid #E2E8F0' }}>
          🚪 {t('signOut')}
        </button>
      </div>
    </aside>
  );
}
