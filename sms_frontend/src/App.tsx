import ReactGA from "react-ga4";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";

import { SnackbarContextProvider } from "@/contexts/SnackbarContext";

import "./App.css";
import { NavBar } from "./components/Layout/Layout";
import { RequireAuth } from "./components/RequireAuth/RequireAuth";
import { DrawerContextProvider } from "./contexts/DrawerContext";
import { LocalStorageContextProvider } from "./contexts/LocalStorageContext";
import theme from "./hooks/theme";
import { AboutView } from "./pages/AboutView";
import { AdminView } from "./pages/AdminView";
import { ListView } from "./pages/ListView";
import { LoginView } from "./pages/LoginView";
import { LogoutView } from "./pages/LogoutView";
import { MapView } from "./pages/MapView";
import { NotFoundView } from "./pages/NotFoundView";
import { SearchView } from "./pages/SearchView";
import { VenuesView } from "@/pages";

// We only want to run Google Analytics in production.
if (process.env.NODE_ENV === "production") {
  ReactGA.initialize("G-HGEJWK9DS2");
}

const App = () => {
  return (
    <div id="app-wrapper" style={{ height: "100vh", width: "100vw" }}>
      <LocalStorageContextProvider>
        <DrawerContextProvider>
          <SnackbarContextProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<NavBar />}>
                    <Route index element={<Navigate to="/list" />} />
                    <Route path="list" element={<ListView />} />
                    <Route path="map" element={<MapView />} />
                    <Route path="search" element={<SearchView />} />
                    <Route path="about" element={<AboutView />} />
                    <Route path="venues" element={<VenuesView />} />
                    <Route path="login" element={<LoginView />} />
                    <Route path="logout" element={<LogoutView />} />
                    <Route
                      path="admin"
                      element={
                        <RequireAuth>
                          <AdminView />
                        </RequireAuth>
                      }
                    />
                    <Route path="*" element={<NotFoundView />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </SnackbarContextProvider>
        </DrawerContextProvider>
      </LocalStorageContextProvider>
    </div>
  );
};

export default App;
