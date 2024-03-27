import FilterPanel from "../../components/FilterPanel/FilterPanel";
import Map from "../../components/Map/Map";
import "leaflet/dist/leaflet.css";
import { usePageTitle, usePageDescription } from "../../hooks/metaTags";

const MapView = () => {
  usePageTitle("Seattle Show & Open Mic Map");
  usePageDescription("See all shows & open mics in Seattle on a map.");

  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
};

export default MapView;
