import FilterPanel from '../../components/FilterPanel/FilterPanel.js';
import Map from '../../components/Map/Map.js';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';



const MapView = () => {
  useEffect(() => {
    document.title = "Seattle Show & Open Mic Map"
  });

  return (
    <div>
      <FilterPanel />
      <Map />
    </div>
  );
}

export default MapView;