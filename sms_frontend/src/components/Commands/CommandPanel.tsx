import { useContext } from "react";

import { Box, Button, Typography } from "@mui/material";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { useVenues } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";

export const CommandPanel = () => {
  const { setSnackbar } = useContext(SnackbarContext) || {};
  const [_venues, setVenues] = useVenues();

  const doVenueMerge = () => {
    customAxios.post("/api/commands/alias_and_merge_all_venues").then(
      (_response) => {
        setSnackbar({
          message: "Venues merged!",
          severity: "success",
          open: true,
        });
        // Trigger a reload of local venue data after merging.
        customAxios.get("api/venues").then((res) => {
          setVenues(res.data);
        });
      },
      (error) => {
        setSnackbar({
          message: `Error merging venues: ${error}`,
          severity: "error",
          open: true,
        });
      },
    );
  };

  return (
    <Box>
      <Box>
        <Typography sx={{ marginBottom: "1rem", width: "sm", maxWidth: "sm" }}>
          Merges venues together based on their regex based alias fields. If a
          venue has an alias field it is assumed to be correct, venues are
          always merged into ones that have an alias field set.
        </Typography>
        <Button variant="contained" onClick={doVenueMerge}>
          Merge All Venues
        </Button>
      </Box>
    </Box>
  );
};
