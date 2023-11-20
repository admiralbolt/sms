import FilterPanel from '../../components/FilterPanel/FilterPanel.js';
import Map from '../../components/Map/Map.js';
import 'leaflet/dist/leaflet.css';


const MapView = () => {
  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
}

export default MapView;