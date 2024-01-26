import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout/Layout.js';
import AboutView from './pages/AboutView/AboutView.js';
import ListView from './pages/ListView/ListView.js';
import MapView from './pages/MapView/MapView.js';
import SearchView from './pages/SearchView/SearchView.js';
import NotFoundView from './pages/NotFoundView/NotFoundView.js';

import ReactGA from 'react-ga4';

import { LocalStorageContextProvider } from './contexts/LocalStorageContext.js';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './hooks/theme.js';
import { DrawerContextProvider } from './contexts/DrawerContext.js';

// We only want to run Google Analytics in production.
if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('G-HGEJWK9DS2');
}

const App = () => {
  
  return (
    <div id='app-wrapper' style={{ height: '100vh', width: '100vw' }}>
      <LocalStorageContextProvider>
        <DrawerContextProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/list" />} />
                  <Route path="list" element={<ListView />} />
                  <Route path="map" element={<MapView />} />
                  <Route path="search" element={<SearchView />} />
                  <Route path="about" element={<AboutView />} />
                  <Route path="*" element={<NotFoundView />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </DrawerContextProvider>
      </LocalStorageContextProvider>
    </div>
  )
}



export default App;
