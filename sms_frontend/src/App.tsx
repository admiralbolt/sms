import "./App.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import AboutView from "./pages/AboutView";
import AdminView from "./pages/AdminView";
import EventView from "./pages/EventView";
import ListView from "./pages/ListView";
import LogoutView from "./pages/LogoutView";
import LoginView from "./pages/LoginView";
import MapView from "./pages/MapView";
import NotFoundView from "./pages/NotFoundView";
import SearchView from "./pages/SearchView";
import VenueView from "./pages/VenueView";

import ReactGA from "react-ga4";

import { LocalStorageContextProvider } from "./contexts/LocalStorageContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./hooks/theme";
import { DrawerContextProvider } from "./contexts/DrawerContext";
import RequireAuth from "./components/RequireAuth/RequireAuth";

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
                  <Route path="login" element={<LoginView />} />
                  <Route path="logout" element={<LogoutView />} />
                  <Route path="admin" element={<RequireAuth><AdminView /></RequireAuth>} />
                  <Route path="api/venues/:id" element={<RequireAuth><VenueView /></RequireAuth>} />
                  <Route path="api/events/:id" element={<RequireAuth><EventView /></RequireAuth>} />
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
