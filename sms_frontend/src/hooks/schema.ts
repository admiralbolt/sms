import { useEffect, useState } from "react";

import customAxios from "./customAxios";

const useSchema = () => {
  const [eventSchema, setEventSchema] = useState<object>({});
  const [venueSchema, setVenueSchema] = useState<object>({});
  const [openMicSchema, setOpenMicSchema] = useState<object>({});

  useEffect(() => {
    customAxios.get("/api/schema").then((res) => {
      setEventSchema(res.data["components"]["schemas"]["Event"]);
      setVenueSchema(res.data["components"]["schemas"]["Venue"]);
      setOpenMicSchema(res.data["components"]["schemas"]["OpenMic"]);
    });
  }, []);

  return { eventSchema, openMicSchema, venueSchema };
}

export { useSchema };