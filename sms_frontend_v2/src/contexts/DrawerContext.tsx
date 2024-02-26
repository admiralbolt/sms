import { createContext, useState } from "react";

const DrawerContext = createContext<
  | {
      drawerOpen: boolean;
      setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

const DrawerContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

export { DrawerContext, DrawerContextProvider };
