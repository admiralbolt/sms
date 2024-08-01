import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  Autocomplete,
  AutocompleteChangeReason,
  Box,
  Button,
  Divider,
  TextField,
} from "@mui/material";

import { getArtistById } from "@/hooks/api";
import customAxios from "@/hooks/customAxios";
import { Artist } from "@/types";

import { ArtistCard } from "./ArtistCard";

export const ArtistPanel = () => {
  const [results, setResults] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  const [keyword] = useDebounce(inputValue, 500);

  const handleChange = (
    _event: any,
    value: Artist | null,
    _reason: AutocompleteChangeReason,
    _details: any | undefined,
  ) => {
    setIsNew(false);
    setSelectedArtist(value == null ? null : value);
  };

  useEffect(() => {
    if (!open) {
      setResults([]);
    }
  }, [open]);

  const search = () => {
    if (keyword.length == 0) return;

    customAxios
      .get("api/artist_search", {
        params: {
          keyword: keyword,
          include_hidden: true,
        },
      })
      .then((response) => {
        setResults(response.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    search();
  }, [keyword]);

  const createArtist = () => {
    setIsNew(true);
    setSelectedArtist({} as Artist);
  };

  const reloadData = (id?: number) => {
    (async () => {
      setSelectedArtist(await getArtistById(id));
    })();
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
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          options={results}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Artist" />}
          getOptionLabel={(artist: Artist) => {
            return artist.name;
          }}
          // Filtering / scoring is already done by our search api, no need to
          // filter results again.
          filterOptions={(options, _state) => options}
          loading={loading}
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
