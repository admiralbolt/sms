// Global alerting component!
// See https://mui.com/material-ui/react-alert/ for severity options.
import React, { createContext, useState } from "react";

import { Alert, AlertColor, Snackbar } from "@mui/material";

type Snackbar = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

const useValue = () => {
  const [snackbar, setSnackbar] = useState<Snackbar>({
    open: false,
    message: "",
    severity: "error",
  });

  return { snackbar, setSnackbar };
};

const SnackbarContext = createContext<{
  snackbar: Snackbar;
  setSnackbar: React.Dispatch<React.SetStateAction<Snackbar>>;
}>({} as ReturnType<typeof useValue>);

const SnackbarContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { snackbar, setSnackbar } = useValue();

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;

    setSnackbar({
      open: false,
      message: snackbar.message,
      severity: snackbar.severity,
    });
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, setSnackbar }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {children}
    </SnackbarContext.Provider>
  );
};

export { SnackbarContext, SnackbarContextProvider };
