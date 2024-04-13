import VenueForm from "@/components/VenueForm";
import { getVenueById } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Venue } from "@/types";

const VenueView = () => {
  let { id } = useParams();
  let [venue, setVenue] = useState<Venue>({});

  useEffect(() => {
    (async () => {
      setVenue(await getVenueById(id || 0));
    })();
  }, [id]);

  return (
    <VenueForm venue={venue} />
  );
};

export default VenueView;