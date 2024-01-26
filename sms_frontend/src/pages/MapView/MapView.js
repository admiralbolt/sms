import FilterPanel from '../../components/FilterPanel/FilterPanel.js';
import Map from '../../components/Map/Map.js';
import 'leaflet/dist/leaflet.css';
import { usePageTitle, usePageDescription } from '../../hooks/metaTags.js';



const MapView = () => {
  usePageTitle("Seattle Show & Open Mic Map");
  usePageDescription("See all shows & open mics in Seattle on a map.");

  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
}

export default MapView;