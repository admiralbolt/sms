import { useContext } from "react";

import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

import { DrawerContext } from "@/contexts/DrawerContext";
import { useIsMobile } from "@/hooks/window";
import FilterPanelContent from "./FilterPanelContent";

const drawerWidth = 280;
// const drawerBleeding = 30;

const FilterPanel = () => {
  const isMobile = useIsMobile();
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext) || {};

  const closeDrawer = (set: boolean) => () => {
    setDrawerOpen?.(set);
  };

  if (!isMobile) {
    return (
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <FilterPanelContent />
      </Drawer>
    );
  }

  return (
    <SwipeableDrawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer(false)}
      onOpen={closeDrawer(true)}
      disableSwipeToOpen={true}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <FilterPanelContent />
    </SwipeableDrawer>
  );
};

export default FilterPanel;
