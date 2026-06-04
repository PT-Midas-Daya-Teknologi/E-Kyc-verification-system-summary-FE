import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import DashboardPage from './DashboardPage';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
} from './services/authStorage.js';
import { applyAccessTokenToClient, setUnauthorizedHandler } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

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

  const handleLogout = () => {
    clearSession();
    applyAccessTokenToClient();
    setUser(null);
  };

  if (bootstrapping) {
    return null;
  }

  const token = getAccessToken();
  if (!user || !token) {
    return <LoginForm onLogin={setUser} />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} />;
}
