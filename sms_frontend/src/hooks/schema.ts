import { useEffect, useState } from "react";

import customAxios from "./customAxios";

const useSchema = () => {
  const [artistSchema, setArtistSchema] = useState<object>({});
  const [eventSchema, setEventSchema] = useState<object>({});
  const [venueSchema, setVenueSchema] = useState<object>({});
  const [openMicSchema, setOpenMicSchema] = useState<object>({});

  useEffect(() => {
    customAxios.get("/api/schema").then((res) => {
      setArtistSchema(res.data["components"]["schemas"]["Artist"]);
      setEventSchema(res.data["components"]["schemas"]["Event"]);
      setVenueSchema(res.data["components"]["schemas"]["Venue"]);
      setOpenMicSchema(res.data["components"]["schemas"]["OpenMic"]);
    });
  }, []);

  return { artistSchema, eventSchema, openMicSchema, venueSchema };
};

export { useSchema };
