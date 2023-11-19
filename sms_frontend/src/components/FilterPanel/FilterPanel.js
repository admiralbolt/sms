import React, { useState } from 'react';

import { useEvents, useVenues } from '../../hooks/api';
import useWindowDimensions from '../../hooks/window';

import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import FilterPanelContent from './FilterPanelContent.js';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';

import './FilterPanel.css';

const drawerWidth = 240;
const drawerBleeding = 56;

const Puller = styled(Box)(() => ({
  width: 300,
  height: 600,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  right: 0
}));

const FilterPanel = () => {
  const [eventsByVenue, eventsByDate, eventTypes] = useEvents();
  const [venues, venueTypes] = useVenues();
  const { height, width } = useWindowDimensions();
  const [open, setOpen] = useState(false);

  // Select between swipeable and permanent drawer depending on screen width.
  const permanent = width > 600;

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // return (
  //   <div class='filter-panel-wrapper'>
  //     <ul>
  //       {eventTypes.map((type) => (
  //         <li>{type}</li>
  //       ))}
  //     </ul>

  //     <ul>
  //       {venueTypes.map((type) => (
  //         <li>{type}</li>
  //       ))}
  //     </ul>
  //   </div>
  // )

  if (permanent) {
    return (
<Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <FilterPanelContent />
      </Drawer>
    );
  }

  return ( <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true
        }}
        >
          <FilterPanelContent />
        </SwipeableDrawer>
  );
};
 
export default FilterPanel