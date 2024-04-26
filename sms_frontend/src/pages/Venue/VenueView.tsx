import { VenueForm } from "./VenueForm";
import { getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Venue } from "@/types";

export const VenueView = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue>();

  useEffect(() => {
    (async () => {
      setVenue(await getVenueById(id || 0));
    })();
  }, [id]);

  return venue ? <VenueForm venue={venue} /> : <></>;
};
