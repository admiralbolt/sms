import { Outlet, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateSelectorTabs from '../DateSelectorTabs/DateSelectorTabs';
import { useContext } from 'react';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { Typography } from '@mui/material';
import { DrawerContext } from '../../contexts/DrawerContext';
import { useAppBarHeight, useFilterPanelWidth } from '../../hooks/materialHacks';

const NavBar = () => {
  const { selectedDate } = useContext(LocalStorageContext);
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext);
  const appBarHeight = useAppBarHeight();

  const huh = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 999999, padding: 0, margin: 0}}>
        <Toolbar>
          <Link to="/map">
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <MapIcon />
            </IconButton>
          </Link>
          <Link to="/list">
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <ListIcon />
            </IconButton>
          </Link>
          <Link to="/about">
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <InfoIcon />
            </IconButton>
          </Link>
          <Box sx={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "flex-end" }}>
            <IconButton onClick={huh} size="large" edge="start" color="secondary">
              <FilterListIcon />
            </IconButton>
          </Box>
        </Toolbar>
        <DateSelectorTabs />
      </AppBar>
      <Toolbar sx={{ height: `${appBarHeight}px` }} />
      <Outlet />
    </Box>
  );
}

export default NavBar;