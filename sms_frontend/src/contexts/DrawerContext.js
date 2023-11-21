import { createContext, useEffect, useState } from 'react';

const DrawerContext = createContext();

const DrawerContextProvider = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // const toggleDrawer = useEffect(() => {
  //   setDrawerOpen(!drawerOpen);
  // }, []);

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen}}>
      {children}
    </DrawerContext.Provider>
  )
}

export { DrawerContext, DrawerContextProvider };