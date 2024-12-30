import { Venue } from "@/types";

const mapsLink = (venue: Venue) => {
  return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
};

export { mapsLink };
