import { useState } from "react";

import { VenueList } from "@/components/Venues/VenueList";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

import { useIsAuthenticated } from "@/hooks/auth";
import { VenueForm } from "./VenueForm";

import { Venue } from "@/types";

import { Button } from "@mui/material";

export const VenueSearchView = () => {
  const [isAuthenticated, _] = useIsAuthenticated();
  const [createNew, setCreateNew] = useState<boolean>(false);

  usePageTitle("Seattle Venues");
  usePageDescription("Search all venues in Seattle.");
  
  if (createNew) {
    return (
      <VenueForm
        venue={{} as Venue}
        setEdit={setCreateNew}
        isNew={true}
      />
    );
  } else {
    return (
      <>
        {isAuthenticated && (
          <Button onClick={() => {setCreateNew(true);}}>
            Create New Venue
          </Button>
        )}
        <div style={{ padding: "12px 5px 5px 5px" }}>
          <VenueList />
        </div>
      </>
    );
  }
};
