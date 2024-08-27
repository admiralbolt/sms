// Top level component that gets routed to.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getVenueBySlug } from "@/hooks/api";
import { Venue } from "@/types";

import { VenueDetail } from "./VenueDetail";
import { Typography } from "@mui/material";

import { setMeta } from "@/utils/seo";

export const VenuePage = () => {
  const [venue, setVenue] = useState<Venue>({} as Venue);
  const { slug } = useParams();

  useEffect(() => {
    getVenueBySlug(slug).then((res) => {
      setVenue(res);
      // TODO: Set the description here eventually once the venue descriptions
      //   have actually been vetted.
      setMeta({
        title: `Seattle Music Venue - ${res.name}`
      });
    });
  }, [slug]);

  if (Object.keys(venue).length === 0) {
    return (
      <Typography sx={{fontSize: "2rem", padding: "1rem"}}>
        No Such Venue found <br />
        Try typing better
      </Typography>
    );
  } else {
    return (<VenueDetail venue={venue} />);
  }
};
