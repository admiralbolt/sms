import { FilterPanel } from "@/components";
import Map from "./Map/Map";
import "leaflet/dist/leaflet.css";
import { usePageTitle, usePageDescription } from "@/hooks/metaTags";

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
