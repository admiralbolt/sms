import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  Box,
  CircularProgress,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";

import { EventCard } from "@/components/Events/EventCard";
import customAxios from "@/hooks/customAxios";
import { Event } from "@/types";

const MAX_RESULTS = 50;

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const search = () => {
    if (keyword.length == 0) return;

    customAxios
      .get("api/event_search", {
        params: {
          keyword: keyword,
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

  const renderSearch = () => {
    if (loading) {
      return <CircularProgress sx={{ marginTop: "1em" }} />;
    }

    return (
      <>
        <Typography>
          {results.length == MAX_RESULTS ? `${MAX_RESULTS}+` : results.length}{" "}
          results
        </Typography>
        <List
          sx={{
            paddingBottom: "2rem",
          }}
        >
          {results.map((result) => (
            <ListItem key={`event-${result.id}`}>
              <EventCard event={result} showDate={true} />
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  return (
    <Box>
      <TextField
        id="search-input"
        label="Search!"
        variant="outlined"
        fullWidth={true}
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
          setLoading(true);
        }}
      />
      {renderSearch()}
    </Box>
  );
};
