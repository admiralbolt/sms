// Top level component that gets routed to.
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { SnackbarContext } from "@/contexts/SnackbarContext";
import { getVenueBySlug } from "@/hooks/api";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";
import { Venue } from "@/types";

import { VenueDetail } from "./VenueDetail";

export const VenuePage = () => {
  const [venue, setVenue] = useState<Venue>({} as Venue);
  const { slug } = useParams();

  const { setSnackbar } = useContext(SnackbarContext) || {};

  usePageTitle("Seattle Venues");
  usePageDescription("Search all venues in Seattle.");

  useEffect(() => {
    (async () => {
      const venue = await getVenueBySlug(slug);
      if (venue) {
        setVenue(venue);
        usePageTitle(`Seattle Music Venue - ${venue.name}`);
        // TODO: Update the page description here based on the venue
        //   descriptions eventually. Right now these aren't very good.
        // useDescription(`${venue.description}`);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: "No such venue exists.",
        });
      }
    })();
  }, [slug]);

  return <>{venue && <VenueDetail venue={venue} />}</>;
};
