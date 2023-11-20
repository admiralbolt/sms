import { Outlet, Link } from 'react-router-dom';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';

import './Layout.css';

const NavBar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ zIndex: 999999}}>
        <Toolbar>
          <Link to="/map">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <MapIcon />
            </IconButton>
          </Link>
          <Link to="/calendar">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <CalendarMonthIcon />
            </IconButton>
          </Link>
          <Link to="/about">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 4 }}
            >
              <InfoIcon />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Outlet />
    </Box>
  );
}

export default NavBar;