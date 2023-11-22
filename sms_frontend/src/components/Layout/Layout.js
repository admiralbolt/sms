import { Outlet, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/Info';
import { useContext } from 'react';
import { LocalStorageContext } from '../../contexts/LocalStorageContext';
import { Typography } from '@mui/material';
import { DrawerContext } from '../../contexts/DrawerContext';

const NavBar = () => {
  const { selectedDate } = useContext(LocalStorageContext);
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext);

  const huh = () => {
    setDrawerOpen(!drawerOpen);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 999999}}>
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
          <Box style={{ flex: 1}}>
            <Typography onClick={huh} style={{ float: "right" }}>
              {selectedDate.format('ddd, MMM. D')}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Outlet />
    </Box>
  );
}

export default NavBar;