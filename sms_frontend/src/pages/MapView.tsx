import "leaflet/dist/leaflet.css";

import { FilterPanel } from "@/components/FilterPanel";
import { Map } from "@/components/Map";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

export const MapView = () => {
  usePageTitle("Seattle Show & Open Mic Map");
  usePageDescription("See all shows & open mics in Seattle on a map.");

  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
};