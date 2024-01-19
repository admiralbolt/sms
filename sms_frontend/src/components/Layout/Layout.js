import { Outlet, NavLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateSelectorTabs from '../DateSelectorTabs/DateSelectorTabs';
import React, { useEffect, useState, useContext } from 'react';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { DrawerContext } from '../../contexts/DrawerContext';
import { useAppBarHeight, useFilterPanelWidth } from '../../hooks/materialHacks';

const NavBar = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { selectedDate } = useContext(LocalStorageContext);
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext);
  const { pathname } = useLocation();
  const appBarHeight = useAppBarHeight();

  const huh = () => {
    setDrawerOpen(!drawerOpen);
  }

  useEffect(() => {
    setShowFilters(['/list', '/map'].includes(pathname));
  }, [pathname]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 999999, padding: 0, margin: 0}}>
        <Toolbar>
        <NavLink to="/list">
            {({ isActive, isPending, isTransitioning }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={(isActive) ? "primary" : ""}
                sx={{ mr: 4 }}
              >
                <ListIcon />
              </IconButton>
            )}
          </NavLink>
          <NavLink to="/map">
            {({ isActive, isPending, isTransitioning }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={(isActive) ? "primary" : ""}
                sx={{ mr: 4 }}
              >
                <MapIcon />
              </IconButton>
            )}
          </NavLink>
          <NavLink to="/about">
            {({ isActive, isPending, isTransitioning }) => (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                color={(isActive) ? "primary" : ""}
                sx={{ mr: 4 }}
              >
                <InfoIcon />
              </IconButton>
            )}
          </NavLink>
          {showFilters &&
            <Box sx={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "flex-end" }}>
              <IconButton onClick={huh} size="large" edge="start" color="secondary">
                <FilterListIcon />
              </IconButton>
            </Box>
          }
        </Toolbar>
        {showFilters &&
          <DateSelectorTabs />
        }
      </AppBar>
      <Toolbar style={{ height: appBarHeight }} />
      <Outlet />
    </Box>
  );
}

export default NavBar;