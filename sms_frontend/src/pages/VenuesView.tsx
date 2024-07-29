import { VenueList } from "@/components/Venues/VenueList";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

export const VenuesView = () => {
  usePageTitle("Seattle Venues");
  usePageDescription("Search all venues in Seattle.");

  return (
    <div style={{ padding: "12px 5px 5px 5px" }}>
      <VenueList />
    </div>
  );
};
