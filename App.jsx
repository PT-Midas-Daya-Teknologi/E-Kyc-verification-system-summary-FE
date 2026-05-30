import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import DashboardPage from './DashboardPage';
import { getAccessToken, getStoredUser } from './services/authStorage.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setBootstrapping(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (bootstrapping) {
    return null;
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return <DashboardPage user={user} onLogout={handleLogout} />;
}
