import { useState } from 'react';
import { api } from '../api';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.auth.login : api.auth.signup;
      const data = await fn(form);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D1B3E 0%, #142854 50%, #1D3A6B 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏘</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>PropertyPilot AI™</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            by <strong>Faithfulord</strong> · Faith Growth Agency
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
          <button onClick={() => setMode('login')} style={{
            flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
            background: mode === 'login' ? '#fff' : 'transparent',
            color: mode === 'login' ? 'var(--navy)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '.15s',
            boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
          }}>Sign In</button>
          <button onClick={() => setMode('signup')} style={{
            flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
            background: mode === 'signup' ? '#fff' : 'transparent',
            color: mode === 'signup' ? 'var(--navy)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '.15s',
            boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
          }}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Full Name</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Password</label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
              placeholder="••••••••"
            />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: 13, background: 'var(--red-pale)', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            background: 'var(--navy)', color: 'var(--gold)', border: 'none',
            padding: '12px 0', borderRadius: 8, fontWeight: 600, fontSize: 15,
            cursor: loading ? 'wait' : 'pointer', marginTop: 4
          }}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          PropertyPilot AI™ · Nebius AI Builders Challenge 2025<br />
          Created by <strong>Faithfulord</strong> · Faith Growth Agency · London SE1
        </div>
      </div>
    </div>
  );
}
