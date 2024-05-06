import Fuse, { FuseResult } from "fuse.js";
import { useEffect, useState } from "react";

import { Box, List, ListItem, TextField, Typography } from "@mui/material";

import { EventCard } from "@/components/Events/EventCard";
import { useFlatEvents, useVenueMap } from "@/hooks/flatFileApi";
import { Event } from "@/types";

const MAX_RESULTS = 50;

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, , allEventsList] = useFlatEvents();
  const venueMap = useVenueMap();

  const [matches, setMatches] = useState<FuseResult<Event>[]>([]);
  const [fuse, setFuse] = useState<Fuse<Event>>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fuseOptions = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    includeMatches: true,
    findAllMatches: true,
    minMatchCharLength: 2,
    threshold: 0.2,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    keys: ["title"],
  };

  useEffect(() => {
    setFuse(new Fuse(allEventsList, fuseOptions));
  }, [allEventsList, fuseOptions]);

  useEffect(() => {
    if (fuse == null) return;

    const matchList = fuse.search(searchTerm);
    setMatches(matchList.slice(0, MAX_RESULTS));
  }, [fuse, searchTerm]);

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
        }}
      />
      {matches.length > 0 && (
        <Typography>
          {matches.length == MAX_RESULTS ? `${MAX_RESULTS}+` : matches.length}{" "}
          results
        </Typography>
      )}
      <List
        sx={{
          paddingBottom: "2rem",
        }}
      >
        {matches.map((match) => (
          <ListItem key={`event-${match.item.id}`}>
            {venueMap?.[match?.item?.venue] ? (
              <EventCard event={match.item} showDate={true} />
            ) : (
              <>Unable to find event</>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};