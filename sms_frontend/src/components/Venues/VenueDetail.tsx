import { Venue } from "@/types";

import { VenueCard } from "./VenueCard";


interface Props {
  venue: Venue;
}

export const VenueDetail = ({ venue }: Props) => {
  
  return (
    <VenueCard venue={venue} />
  );
};
