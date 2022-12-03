import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './pages/Layout';
import Home from './pages/Home';
import Other from './pages/Other';
import NoPage from './pages/NoPage';
import Map from './pages/Map/Map';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';

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
      loadProfile()
      setloadedProfile(true);
    }
  }, [loadedProfile])

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ProfileContext.Provider value={{ get: profile, set: setProfile }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="map" element={<Map />} />
              <Route path="other" element={<Other />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </ProfileContext.Provider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
