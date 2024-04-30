import { useState } from "react";

import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  Divider,
  TextField,
} from "@mui/material";

import { useOpenMics } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { OpenMic } from "@/types";

import { OpenMicCard } from "./OpenMicCard";

export const OpenMicPanel = () => {
  const [openMics, setOpenMics] = useOpenMics();

  const [selectedMic, setSelectedMic] = useState<OpenMic | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);

  const handleChange = (
    _event: any,
    value: OpenMic | null,
    _reason: AutocompleteChangeReason,
    _details: any | undefined,
  ) => {
    setIsNew(false);
    setSelectedMic(value == null ? null : value);
  };

  const createOpenMic = () => {
    setIsNew(true);
    setSelectedMic({} as OpenMic);
  };

  const reloadData = (id?: number) => {
    customAxios.get("api/open_mics").then((res) => {
      setOpenMics(res.data);
      const o = res.data.find((o: OpenMic) => o.id == id);
      if (o != undefined) {
        setSelectedMic(o);
      }
    });
  };

  const onDelete = () => {
    if (selectedMic == null) return;

    reloadData();
    setSelectedMic(null);
    setInputValue("");
  };

  const onCreate = (id: number) => {
    if (selectedMic == null) return;

    reloadData(id);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Autocomplete
          options={openMics}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Open Mic" />}
          getOptionLabel={(mic: OpenMic) => {
            return mic.name;
          }}
          onChange={handleChange}
          value={selectedMic}
          inputValue={inputValue}
          onInputChange={(_, val: string) => {
            setInputValue(val);
          }}
        />
        <Button
          sx={{ marginLeft: "1em", height: "3em" }}
          variant="contained"
          onClick={createOpenMic}
        >
          Create New
        </Button>
      </Box>
      <Box width="100%" height="2em" />
      <Divider />
      {selectedMic != undefined && (
        <OpenMicCard
          openMic={selectedMic}
          isNew={isNew}
          deleteCallback={onDelete}
          createCallback={onCreate}
        />
      )}
    </Box>
  );
};
