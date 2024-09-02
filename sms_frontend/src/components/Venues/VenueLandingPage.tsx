import { useState } from "react";

import { Button } from "@mui/material";

import { VenueSearch } from "@/components/Venues";
import { useIsAuthenticated } from "@/hooks/auth";
import { Venue } from "@/types";
import { setMeta } from "@/utils/seo";

import { VenueForm } from "./VenueForm";

export const VenueLandingPage = () => {
  const [isAuthenticated, _] = useIsAuthenticated();
  const [createNew, setCreateNew] = useState<boolean>(false);

  setMeta({
    title: "Seattle Venues",
    description: "Search all music venues in Seattle.",
  });

  if (createNew) {
    return (
      <VenueForm venue={{} as Venue} setEdit={setCreateNew} isNew={true} />
    );
  } else {
    return (
      <>
        {isAuthenticated && (
          <Button
            onClick={() => {
              setCreateNew(true);
            }}
          >
            Create New Venue
          </Button>
        )}
        <div style={{ padding: "12px 5px 5px 5px" }}>
          <VenueSearch />
        </div>
      </>
    );
  }
};
