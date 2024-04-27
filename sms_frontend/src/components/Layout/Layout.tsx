import { Outlet, NavLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MapIcon from "@mui/icons-material/Map";
import ListIcon from "@mui/icons-material/List";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DateSelectorTabs } from "./DateSelectorTabs";
import { useEffect, useState, useContext } from "react";
// import { LocalStorageContext } from "../../contexts/LocalStorageContext";
import { DrawerContext } from "@/contexts/DrawerContext";
import { useAppBarHeight } from "@/hooks/materialHacks";
import { useIsAuthenticated } from "@/hooks/auth";
import { AdminPanelSettings } from "@mui/icons-material";

export const Layout = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated] = useIsAuthenticated();
  // const { selectedDate } = useContext(LocalStorageContext) || {};
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext) || {};
  const { pathname } = useLocation();
  const appBarHeight = useAppBarHeight();

  const huh = () => {
    setDrawerOpen?.(!drawerOpen);
  };

  useEffect(() => {
    setShowFilters(["/list", "/map"].includes(pathname));
  }, [pathname]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 999999, padding: 0, margin: 0 }}>
        <Toolbar>
          <NavLink to="/list">
            {({ isActive }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={isActive ? "primary" : undefined}
                sx={{ mr: 4 }}
              >
                <ListIcon />
              </IconButton>
            )}
          </NavLink>
          <NavLink to="/map">
            {({ isActive }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={isActive ? "primary" : undefined}
                sx={{ mr: 4 }}
              >
                <MapIcon />
              </IconButton>
            )}
          </NavLink>
          <NavLink to="/search">
            {({ isActive }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={isActive ? "primary" : undefined}
                sx={{ mr: 4 }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </NavLink>
          <NavLink to="/about">
            {({ isActive }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={isActive ? "primary" : undefined}
                sx={{ mr: 4 }}
              >
                <InfoIcon />
              </IconButton>
            )}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/admin">
              {({ isActive }) => (
                <IconButton
                  size="large"
                  edge="start"
                  aria-label="menu"
                  color={isActive ? "primary" : undefined}
                  sx={{ mr: 4 }}
                >
                  <AdminPanelSettings />
                </IconButton>
              )}
            </NavLink>
          )}
          {showFilters && (
            <Box
              sx={{
                display: "flex",
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              <IconButton
                onClick={huh}
                size="large"
                edge="start"
                color="secondary"
              >
                <FilterListIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
        {showFilters && <DateSelectorTabs />}
      </AppBar>
      <Toolbar style={{ height: appBarHeight }} />
      <Outlet />
    </Box>
  );
};
