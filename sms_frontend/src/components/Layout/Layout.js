import { Outlet, Link } from 'react-router-dom';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';

import './Layout.css';


const drawerWidth = 240;
const navItems = [
  {
    'link': 'map',
    'icon': 'FaMapLocationDot'
  },
  {
    'link': 'calendar',
    'icon': 'FaCalendar'
  },
  {
    'link': 'about',
    'icon': 'FaCircleInfo'
  }
];

const NavBar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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
      <Outlet />
    </Box>
  );
}


//   return (
//     <>
    
//       <nav id="sms-nav">
//         <ul>
//           <li><Link to="/map">
//               <FaMapLocationDot />
//           </Link></li>
//           <li><Link to="/calendar">Calendar</Link></li>
//           <li><Link to="/about">About</Link></li>
//         </ul>
//       </nav>

//       <div id="sms-content">
//         <Outlet />
//       </div>
//     </>
//   );
// }

export default NavBar;