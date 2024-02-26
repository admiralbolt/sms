import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import AboutView from "./pages/AboutView/AboutView";
import ListView from "./pages/ListView/ListView";
import MapView from "./pages/MapView/MapView";
import SearchView from "./pages/SearchView/SearchView";
import NotFoundView from "./pages/NotFoundView/NotFoundView";

import ReactGA from "react-ga4";

import { LocalStorageContextProvider } from "./contexts/LocalStorageContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./hooks/theme";
import { DrawerContextProvider } from "./contexts/DrawerContext";

// We only want to run Google Analytics in production.
if (process.env.NODE_ENV === "production") {
  ReactGA.initialize("G-HGEJWK9DS2");
}

const App = () => {
  return (
    <div id="app-wrapper" style={{ height: "100vh", width: "100vw" }}>
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
  );
};

export default App;
