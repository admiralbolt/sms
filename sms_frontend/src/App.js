import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout/Layout.js';
import AboutView from './pages/AboutView/AboutView.js';
import CalendarView from './pages/CalendarView/CalendarView.js';
import MapView from './pages/MapView/MapView.js';

import { LocalStorageContextProvider } from './contexts/LocalStorageContext.js';

const App = () => {
  
  return (
    <div id='app-wrapper' style={{ height: '100vh', width: '100vw' }}>
      <LocalStorageContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/map" />} />
              <Route path="map" element={<MapView />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="about" element={<AboutView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LocalStorageContextProvider>
    </div>
  )
}

export default App;
