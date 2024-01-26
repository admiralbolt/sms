import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useAppBarHeight = () => {
  const [appBarHeight, setAppBarHeight] = useState(0);
  const pathname = useLocation();

  useEffect(() => {
    setTimeout(() => {
      const appBars = document.getElementsByClassName('MuiAppBar-root');
      setAppBarHeight(appBars.length > 0 ? appBars[0].clientHeight : 0);
    }, 1);
  }, [pathname]);

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

const useScroller = () => {
  const [scroller, setScroller] = useState({});

    useEffect(() => {
      const scroller = document.getElementsByClassName('MuiTabs-scroller')[0];
      setScroller(scroller);
    }, []);

  return scroller;
}

export { useAppBarHeight, useFilterPanelWidth, useScroller };