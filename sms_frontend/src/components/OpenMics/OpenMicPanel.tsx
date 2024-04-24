import { useOpenMics } from "@/hooks/api";
import OpenMicCard from "./OpenMicCard";

import { useState } from "react";
import { OpenMic } from "@/types";
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, Box, Divider, TextField } from "@mui/material";

const OpenMicPanel = () => {
  const openMics = useOpenMics();

  const [selectedMic, setSelectedMic] = useState<OpenMic | undefined>(undefined);

  const handleChange = (event: any, value: OpenMic | null, reason: AutocompleteChangeReason, details: any | undefined) => {
    if (value == null) {
      setSelectedMic(undefined);
    } else {
      setSelectedMic(value);
    }
  }

  return (
    <Box>
      <Autocomplete
        disablePortal
        options={openMics}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Open Mic" />}
        getOptionLabel={(mic: OpenMic) => {return mic.name}}
        onChange={handleChange}
      />
      <Box width="100%" height="2em" />
      <Divider />
      {(selectedMic != undefined) &&
        <OpenMicCard openMic={selectedMic} />
      }
    </Box>
  );
};

export default OpenMicPanel;