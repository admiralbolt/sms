import { Venue } from "@/types";

const mapsLink = (venue: Venue) => {
  return `https://www.google.com/maps/search/?api=1&query=${venue.name}  ${venue.address} ${venue.city} ${venue.postal_code}`;
};

const formatDomain = (url: string) => {
  let domain = url.split("/")[2];

  if (domain.startsWith("www.")) {
    domain = domain.substring(4);
  }

  return domain;
};

export { formatDomain, mapsLink };
