// import { LocalStorageContext } from "../../contexts/LocalStorageContext";
import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { AdminPanelSettings } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoIcon from "@mui/icons-material/Info";
import ListIcon from "@mui/icons-material/List";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";

import { useIsAuthenticated } from "@/hooks/auth";

import { DrawerContext } from "../../contexts/DrawerContext";
import { useAppBarHeight } from "../../hooks/materialHacks";
import DateSelectorTabs from "../DateSelectorTabs/DateSelectorTabs";

const NavBar = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, _] = useIsAuthenticated();
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

export default NavBar;
