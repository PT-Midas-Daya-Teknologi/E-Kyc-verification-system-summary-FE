import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { fetchUserSessions, getApiErrorMessage } from '../services/api.js';

const containerStyles = {
  minHeight: '100vh',
  background: '#ffffff',
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
};

const mainStyles = {
  maxWidth: '1100px',
  width: '100%',
  margin: '0 auto',
  padding: '1.5rem 1.25rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const headerStyles = {
  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  borderRadius: '1rem',
  padding: '1.25rem 1.5rem',
  color: 'white',
  boxShadow: '0 10px 30px rgba(14, 165, 233, 0.2)',
};

const buttonStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.6rem 0.9rem',
  borderRadius: '0.7rem',
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: 'white',
  fontWeight: '700',
  fontSize: '0.85rem',
  cursor: 'pointer',
  width: 'fit-content',
};

const tableCardStyles = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const thStyles = {
  padding: '0.8rem 1rem',
  textAlign: 'left',
  fontWeight: '700',
  color: '#0369a1',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: '#f0f9ff',
};

const tdStyles = {
  padding: '0.8rem 1rem',
  borderBottom: '1px solid #f1f5f9',
  color: '#1e293b',
  fontSize: '0.875rem',
  verticalAlign: 'top',
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function formatSessionTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatValue(value);
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${values.day} ${values.month} ${values.year} ${values.hour}:${values.minute}`;
}

export default function SessionListPage({ userId, onBack, navigateToDetails }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetchUserSessions(userId, 0, 100);
        const fetchedSessions = response?.body?.data ?? [];
        if (!cancelled) {
          setSessions([...fetchedSessions].sort((first, second) => {
            const firstTime = new Date(first?.createdAt || 0).getTime();
            const secondTime = new Date(second?.createdAt || 0).getTime();
            return secondTime - firstTime;
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err) || 'Unable to load sessions.');
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const sessionCountLabel = useMemo(() => {
    if (loading) return 'Loading sessions…';
    if (!sessions.length) return 'No sessions found';
    return `${sessions.length} session${sessions.length === 1 ? '' : 's'}`;
  }, [loading, sessions.length]);

  const getStatusValue = (session) => {
    if (session?.status != null && session.status !== '') return formatValue(session.status);
    if (typeof session?.isActive === 'boolean') return session.isActive ? 'Active' : 'Inactive';
    return '—';
  };

  return (
    <div style={containerStyles}>
      <div style={mainStyles}>
        <div style={headerStyles}>
          <button type="button" onClick={onBack} style={buttonStyles}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Session List</h2>
            <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
              {sessionCountLabel}
            </p>
          </div>
        </div>

        <div style={tableCardStyles}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#0369a1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Loading sessions…
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No sessions were returned for this user.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyles}>Session Name</th>
                    <th style={thStyles}>Status</th>
                    <th style={thStyles}>Reason</th>
                    <th style={thStyles}>Created At</th>
                    <th style={thStyles}>Updated At</th>
                    <th style={{ ...thStyles, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => {
                    const sessionId = session?.sessionId ?? session?.id ?? null;
                    const sessionName = session?.sessionName ?? session?.session_name ?? null;
                    return (
                      <tr key={`${sessionId ?? 'session'}-${index}`}>
                        <td style={tdStyles}>{formatValue(sessionName)}</td>
                        <td style={tdStyles}>{getStatusValue(session)}</td>
                        <td style={tdStyles}>{formatValue(session?.reason ?? session?.reasonValue)}</td>
                        <td style={tdStyles}>{formatSessionTimestamp(session?.createdAt)}</td>
                        <td style={tdStyles}>{formatSessionTimestamp(session?.updatedAt)}</td>
                        <td style={{ ...tdStyles, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => navigateToDetails?.(session)}
                            style={{
                              padding: '0.45rem 0.8rem',
                              borderRadius: '0.6rem',
                              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(37,99,235,0.18))',
                              border: '1px solid rgba(14, 165, 233, 0.28)',
                              color: '#0369a1',
                              fontWeight: '700',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
