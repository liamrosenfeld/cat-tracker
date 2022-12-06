import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './pages/Layout';
import NoPage from './pages/NoPage';
import Map from './pages/Map/Map';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import AccountSettings from './pages/Account/AccountSettings';

import './index.css';
import { ProfileInfo, ProfileContext, populateProfile } from './profile';

export function App() {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  // load profile when the app first appears
  const [loadedProfile, setloadedProfile] = useState(false);
  useEffect(() => {
    async function loadProfile() {
      await populateProfile(setProfile);
    }
    if (!loadedProfile) {
      loadProfile();
      setloadedProfile(true);
    }
  }, [loadedProfile]);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ProfileContext.Provider value={{ get: profile, set: setProfile }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Map />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="account/settings" element={<AccountSettings />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </ProfileContext.Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
