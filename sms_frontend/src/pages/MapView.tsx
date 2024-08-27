import "leaflet/dist/leaflet.css";

import { FilterPanel } from "@/components/FilterPanel";
import { Map } from "@/components/Map";
import { setMeta } from "@/utils/seo";

export const MapView = () => {
  setMeta({
    title: "Seattle Show & Open Mic Map",
    description: "See all shows & open mics in Seattle on a map.",
  });

  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
};
