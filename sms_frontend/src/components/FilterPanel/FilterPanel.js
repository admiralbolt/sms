import React, { useState } from 'react';

import { useIsMobile } from '../../hooks/window';

import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import FilterPanelContent from './FilterPanelContent.js';

import './FilterPanel.css';

const drawerWidth = 240;
const drawerBleeding = 30;

const FilterPanel = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  if (!isMobile) {
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