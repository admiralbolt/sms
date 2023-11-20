import { useState, useEffect } from 'react';

const useAppBarHeight = () => {
  const [appBarHeight, setAppBarHeight] = useState(0);

  useEffect(() => {
    const appBars = document.getElementsByClassName('MuiAppBar-root');
    setAppBarHeight(appBars.length > 0 ? appBars[0].clientHeight : 0);
  }, []);

  return appBarHeight;
}

const useFilterPanelWidth = () => {
  const [filterPanelWidth, setFilterPanelWidth] = useState(0);

  useEffect(() => {
    const filterPanels = document.getElementsByClassName('MuiDrawer-paperAnchorDockedRight');
    setFilterPanelWidth(filterPanels.length > 0 ? filterPanels[0].clientWidth : 0);
  }, []);

  return filterPanelWidth;
}

export { useAppBarHeight, useFilterPanelWidth };