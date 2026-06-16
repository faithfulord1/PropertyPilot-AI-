import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Agent1 from './components/Agent1';
import Agent2 from './components/Agent2';
import Agent3 from './components/Agent3';
import Dashboard from './components/Dashboard';
import PowerBIGuide from './components/PowerBIGuide';
import PortfolioGuide from './components/PortfolioGuide';
import AuthPage from './components/AuthPage';
import SubscriptionPage from './components/SubscriptionPage';
import { api } from './api';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [agent1Result, setAgent1Result] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ppai_token');
    if (token) {
      api.auth.me().then((data) => {
        setUser(data.user);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('ppai_token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('ppai_token', data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('ppai_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏘</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--navy)' }}>PropertyPilot AI™</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Loading your intelligence platform...</div>
        </div>
      </div>
    );
  }

  if (!user && page !== 'auth') {
    setPage('auth');
  }

  const renderPage = () => {
    if (!user) return <AuthPage onLogin={handleLogin} />;
    switch (page) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'agent1': return <Agent1 onResult={setAgent1Result} />;
      case 'agent2': return <Agent2 prefill={agent1Result} />;
      case 'agent3': return <Agent3 prefill={agent1Result} />;
      case 'powerbi': return <PowerBIGuide />;
      case 'portfolio': return <PortfolioGuide />;
      case 'subscription': return <SubscriptionPage user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {user && <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />}
      <div style={{ flex: 1, marginLeft: user ? 240 : 0, display: 'flex', flexDirection: 'column' }}>
        {user && <TopBar page={page} user={user} onLogout={handleLogout} />}
        <main style={{ flex: 1, padding: 24, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div className="animate-in" key={page}>
            {renderPage()}
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: 'var(--text-muted)' }}>
            PropertyPilot AI™ · Created by <strong>Faithfulord</strong> · Faith Growth Agency · London SE1 · Nebius AI Builders Challenge 2025
          </div>
        </main>
      </div>
    </div>
  );
}
