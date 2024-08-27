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

import { useIsAuthenticated } from "@/hooks/auth";
import customAxios from "@/hooks/customAxios";
import { Venue } from "@/types";

import { VenueListItem } from "./VenueListItem";

const MAX_RESULTS = 10;

export const VenueList = () => {
  const [isAuthenticated] = useIsAuthenticated();
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Venue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const search = () => {
    if (keyword.length == 0) return;

    customAxios
      .get("api/venue_search", {
        params: {
          keyword: keyword,
          include_hidden: isAuthenticated,
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
            <ListItem key={`venue-${result.id}`}>
              <VenueListItem venue={result} />
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
