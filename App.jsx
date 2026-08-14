import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import DashboardPage from './DashboardPage';
import SessionListPage from './components/SessionListPage.jsx';
import SessionDetailsPage from './components/SessionDetailsPage.jsx';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
} from './services/authStorage.js';
import { applyAccessTokenToClient, setUnauthorizedHandler } from './services/api.js';

function getInitialRoute() {
  const historyState = window.history.state?.route;
  if (historyState) return historyState;

  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/sessions')) return 'sessions';
  if (hash.startsWith('#/details')) return 'details';
  return 'dashboard';
}

function getInitialRouteState() {
  const historyState = window.history.state?.state;
  if (historyState) return historyState;

  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/sessions')) return { userId: null };
  if (hash.startsWith('#/details')) return { session: null };
  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [route, setRoute] = useState(getInitialRoute);
  const [routeState, setRouteState] = useState(getInitialRouteState);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      applyAccessTokenToClient();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      applyAccessTokenToClient();
      setUser(storedUser);
    }
    setBootstrapping(false);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getInitialRoute();
      const nextState = getInitialRouteState();
      setRoute(nextRoute);
      setRouteState(nextState);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextRoute, state = null) => {
    setRoute(nextRoute);
    setRouteState(state);

    const hash = nextRoute === 'sessions' ? '#/sessions' : nextRoute === 'details' ? '#/details' : '#/';
    window.history.pushState({ route: nextRoute, state }, '', `${window.location.pathname}${hash}`);
  };

  const handleLogout = () => {
    clearSession();
    applyAccessTokenToClient();
    setUser(null);
    navigateTo('dashboard');
  };

  const token = getAccessToken();
  if (bootstrapping) {
    return null;
  }

  if (!user || !token) {
    return <LoginForm onLogin={setUser} />;
  }

  if (route === 'sessions') {
    return (
      <SessionListPage
        userId={routeState?.userId ?? null}
        onBack={() => navigateTo('dashboard')}
        navigateToDetails={(session) => navigateTo('details', { session, userId: routeState?.userId ?? session?.userId ?? null })}
      />
    );
  }

  if (route === 'details') {
    return (
      <SessionDetailsPage
        session={routeState?.session ?? null}
        onBack={() => navigateTo('sessions', { userId: routeState?.userId ?? null })}
      />
    );
  }

  return <DashboardPage user={user} onLogout={handleLogout} onOpenSessionList={(row) => navigateTo('sessions', { userId: row?.userId ?? row?.id ?? null })} />;
}
