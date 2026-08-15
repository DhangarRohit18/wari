'use client';
import { useState } from 'react';
import { apiCall } from '@/lib/api';
import Sidebar from '@/components/Sidebar';

const DEMO_EVENTS = [
  {
    id: 'SOS_EVENT', icon: '🆘', title: 'Trigger SOS Event', color: '#EF4444',
    desc: 'Creates a medical SOS incident. Admin gets notified. Volunteer assigned.',
    steps: ['SOS created in database', 'Nearest volunteer found', 'Admin WebSocket notified', 'SOS appears in live feed'],
  },
  {
    id: 'NETWORK_FAILURE', icon: '📡', title: 'Network Failure', color: '#F59E0B',
    desc: 'Simulates network outage. Offline mode activates. Relay simulation runs.',
    steps: ['Network failure broadcast', 'App enters offline mode', 'SOS queued locally', 'Relay simulation shows path'],
  },
  {
    id: 'CROWD_SURGE', icon: '🔴', title: 'Crowd Surge', color: '#EF4444',
    desc: 'Increases crowd density across all zones to RED/ORANGE level.',
    steps: ['All zones updated to higher density', 'RED zones appear on map', 'AI prediction updates', 'Route warnings issued'],
  },
  {
    id: 'FOOD_SHORTAGE', icon: '🍛', title: 'Food Shortage', color: '#F97316',
    desc: 'Marks 5 food centres as unavailable. AI recommends additional resources.',
    steps: ['5 food centres closed', 'AI detects shortage', 'Resource prediction updates', 'Admin alert triggered'],
  },
  {
    id: 'WATER_SHORTAGE', icon: '💧', title: 'Water Shortage', color: '#3B82F6',
    desc: 'Marks 5 water points as empty. Risk levels update.',
    steps: ['5 water points marked EMPTY', 'Water risk level: HIGH', 'Recommendation to refill', 'Map updates'],
  },
  {
    id: 'HEAVY_RAIN', icon: '⛈️', title: 'Heavy Rain Alert', color: '#6366F1',
    desc: 'Triggers weather alert. All Varkaris notified. Route warnings issued.',
    steps: ['Weather alert created', 'Broadcast to all users', 'Route warnings activated', 'Shelter recommendations'],
  },
  {
    id: 'LOST_PERSON', icon: '👤', title: 'Lost Person Case', color: '#EC4899',
    desc: 'Creates a missing person case with QR code.',
    steps: ['Lost person case created', 'QR code generated', 'Alert broadcast', 'Volunteers notified'],
  },
  {
    id: 'RESET', icon: '🔄', title: 'Reset Demo Data', color: '#22C55E',
    desc: 'Resets all demo data back to baseline state.',
    steps: ['Crowd zones normalized', 'Food centres reopened', 'Water points refilled', 'Demo ready again'],
  },
];

const JUDGE_SCENARIO = [
  { step: 1, action: 'Login as Varkari', event: null, desc: 'Explore map, services, nearby food/water/medical' },
  { step: 2, action: 'Open Wari Connect', event: null, desc: 'View community posts from nearby pilgrims' },
  { step: 3, action: 'Create "Need water" request', event: null, desc: 'AI finds nearest volunteer with water' },
  { step: 4, action: 'Trigger: Network Failure', event: 'NETWORK_FAILURE', desc: 'App goes offline, relay simulation activates' },
  { step: 5, action: 'Trigger: SOS Event', event: 'SOS_EVENT', desc: 'SOS queued → relayed → admin receives' },
  { step: 6, action: 'Switch to Admin dashboard', event: null, desc: 'See SOS in live feed, assign medical team' },
  { step: 7, action: 'Trigger: Crowd Surge', event: 'CROWD_SURGE', desc: 'Digital Twin turns RED, AI predicts congestion' },
  { step: 8, action: 'View AI Predictions', event: null, desc: 'AI recommends alternate route' },
  { step: 9, action: 'Trigger: Food Shortage', event: 'FOOD_SHORTAGE', desc: 'AI recommends 1,300+ additional meals' },
  { step: 10, action: 'View Analytics', event: null, desc: 'Final overview of all metrics and AI insights' },
  { step: 11, action: 'Reset Demo', event: 'RESET', desc: 'Reset all data for next demonstration' },
];

export default function DemoControlPanel() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const triggerEvent = async (eventId: string) => {
    setLoading(prev => ({ ...prev, [eventId]: true }));
    const ts = new Date().toLocaleTimeString();
    try {
      const result = await apiCall('/demo/trigger', {
        method: 'POST',
        body: JSON.stringify({ event_type: eventId }),
      });
      setResults(prev => ({ ...prev, [eventId]: result }));
      setLog(prev => [`[${ts}] ✅ ${eventId}: ${result.message || 'Success'}`, ...prev.slice(0, 19)]);
    } catch (e: any) {
      setLog(prev => [`[${ts}] ❌ ${eventId}: ${e.message}`, ...prev.slice(0, 19)]);
    } finally {
      setLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleScenarioStep = async (step: typeof JUDGE_SCENARIO[0]) => {
    setCurrentStep(step.step);
    if (step.event) {
      await triggerEvent(step.event);
    }
    setLog(prev => [`[${new Date().toLocaleTimeString()}] 📋 Step ${step.step}: ${step.action}`, ...prev.slice(0, 19)]);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900 }}>🎮 Demo Control Panel</h1>
            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Trigger hackathon demo scenarios in real-time</p>
          </div>
          <span className="badge badge-orange">HACKATHON DEMO MODE</span>
        </header>

        <div className="dashboard-content">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              {/* Quick Trigger Grid */}
              <h3 style={{ marginBottom: '1rem' }}>⚡ Event Triggers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {DEMO_EVENTS.map(event => (
                  <div key={event.id} className="card card-sm" style={{ border: `2px solid ${event.color}20` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '2rem', flexShrink: 0 }}>{event.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: event.color }}>{event.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.125rem' }}>{event.desc}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      {event.steps.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.7rem', color: '#6B7280', padding: '1px 0' }}>
                          {i + 1}. {s}
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-sm btn-full"
                      style={{ background: event.color, color: 'white', borderColor: event.color }}
                      onClick={() => triggerEvent(event.id)}
                      disabled={loading[event.id]}
                    >
                      {loading[event.id] ? '⏳ Triggering...' : `▶ ${event.title}`}
                    </button>
                    {results[event.id] && (
                      <div style={{ marginTop: '0.5rem', background: '#F0FDF4', borderRadius: 6, padding: '0.375rem 0.5rem', fontSize: '0.7rem', color: '#15803D' }}>
                        ✅ {results[event.id].message}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Judge Scenario */}
              <h3 style={{ marginBottom: '1rem' }}>📋 Judge Demo Sequence (5-minute flow)</h3>
              <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {JUDGE_SCENARIO.map(scenario => (
                    <div key={scenario.step}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem',
                        borderRadius: 10, background: currentStep === scenario.step ? '#FFF7ED' : '#F9FAFB',
                        border: currentStep === scenario.step ? '2px solid #F97316' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: currentStep === scenario.step ? '#F97316' : '#E5E7EB',
                        color: currentStep === scenario.step ? 'white' : '#6B7280',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.8rem',
                      }}>{scenario.step}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{scenario.action}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{scenario.desc}</div>
                      </div>
                      {scenario.event && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleScenarioStep(scenario)}
                          disabled={Object.values(loading).some(Boolean)}
                        >
                          ▶ Run
                        </button>
                      )}
                      {!scenario.event && (
                        <button className="btn btn-sm btn-secondary" onClick={() => setCurrentStep(scenario.step)}>
                          Mark
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Log */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>📟 Event Log</h3>
              <div style={{
                background: '#0F172A', borderRadius: 12, padding: '1rem',
                fontFamily: 'monospace', fontSize: '0.75rem', height: 400, overflowY: 'auto',
              }}>
                {log.length === 0 ? (
                  <div style={{ color: '#374151', textAlign: 'center', marginTop: '3rem' }}>
                    No events triggered yet.<br />Click a trigger button above.
                  </div>
                ) : (
                  log.map((entry, i) => (
                    <div key={i} style={{
                      color: entry.includes('✅') ? '#22C55E' : entry.includes('❌') ? '#EF4444' : '#9CA3AF',
                      padding: '2px 0',
                    }}>{entry}</div>
                  ))
                )}
              </div>

              {/* Quick Links */}
              <div className="card" style={{ marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>🔗 Quick Navigation</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: '🗺️ Digital Twin Map', path: '/dashboard/admin/digital-twin' },
                    { label: '🆘 Live SOS Feed', path: '/dashboard/admin/sos' },
                    { label: '🤖 AI Predictions', path: '/dashboard/admin/predictions' },
                    { label: '📊 Analytics', path: '/dashboard/admin/analytics' },
                    { label: '👤 Missing Persons', path: '/dashboard/admin/lost' },
                    { label: '🙏 Varkari View', path: '/dashboard/varkari' },
                  ].map(link => (
                    <a key={link.path} href={link.path} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: '1rem', background: '#0F172A', color: 'white' }}>
                <div style={{ fontSize: '0.7rem', color: '#FB923C', fontWeight: 700, marginBottom: '0.5rem' }}>
                  🎭 DEMO DATA NOTICE
                </div>
                <p style={{ fontSize: 'p0.75rem', color: '#9CA3AF', lineHeight: 1.5 }}>
                  All data is simulated for hackathon demonstration. Crowd counts, predictions, and locations are DEMO DATA only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
