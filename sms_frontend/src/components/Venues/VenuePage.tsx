// Top level component that gets routed to.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { CircularProgress, Typography } from "@mui/material";

import { getVenueBySlug } from "@/hooks/api";
import { Venue } from "@/types";
import { setMeta } from "@/utils/seo";

import { VenueDetail } from "./VenueDetail";

export const VenuePage = () => {
  const [venue, setVenue] = useState<Venue>({} as Venue);
  const [loading, setLoading] = useState<boolean>(true);
  const { slug } = useParams();

  useEffect(() => {
    getVenueBySlug(slug).then((res) => {
      setVenue(res);
      // TODO: Set the description here eventually once the venue descriptions
      //   have actually been vetted.
      setMeta({
        title: `Seattle Music Venue - ${res.name}`,
      });
      setLoading(false);
    }, (_) => {
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <CircularProgress sx={{ marginLeft: "1em", marginTop: "1em" }} />
    );
  }

  if (Object.keys(venue).length === 0) {
    return (
      <Typography sx={{ fontSize: "2rem", padding: "1rem" }}>
        No Such Venue found <br />
        Try typing better
      </Typography>
    );
  } else {
    return <VenueDetail venue={venue} />;
  }
};
