import { useState } from "react";

import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  Divider,
  TextField,
} from "@mui/material";

import { useArtists } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Artist } from "@/types";

import { ArtistCard } from "./ArtistCard";

export const ArtistPanel = () => {
  const [Artists, setArtists] = useArtists();

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);

  const handleChange = (
    _event: any,
    value: Artist | null,
    _reason: AutocompleteChangeReason,
    _details: any | undefined,
  ) => {
    setIsNew(false);
    setSelectedArtist(value == null ? null : value);
  };

  const createArtist = () => {
    setIsNew(true);
    setSelectedArtist({} as Artist);
  };

  const reloadData = (id?: number) => {
    customAxios.get("api/Artists").then((res) => {
      setArtists(res.data);
      const v = res.data.find((o: any) => o.id == id);
      if (v != undefined) {
        setSelectedArtist(v);
      }
    });
  };

  const onDelete = () => {
    if (selectedArtist == null) return;

    reloadData();
    setSelectedArtist(null);
    setInputValue("");
  };

  const onCreate = (id: number) => {
    if (selectedArtist == null) return;

    reloadData(id);
  };

  const onUpdate = (id: number) => {
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
          options={Artists}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Artist" />}
          getOptionLabel={(Artist: Artist) => {
            return Artist.name;
          }}
          onChange={handleChange}
          value={selectedArtist}
          inputValue={inputValue}
          onInputChange={(_, val: string) => {
            setInputValue(val);
          }}
        />
        <Button
          sx={{ marginLeft: "1em", height: "3em" }}
          variant="contained"
          onClick={createArtist}
        >
          Create New
        </Button>
      </Box>
      <Box width="100%" height="2em" />
      <Divider />
      {selectedArtist != null && (
        <ArtistCard
          artist={selectedArtist}
          isNew={isNew}
          deleteCallback={onDelete}
          createCallback={onCreate}
          updateCallback={onUpdate}
        />
      )}
    </Box>
  );
};
