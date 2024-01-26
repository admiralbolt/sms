import EventList from '../../components/EventList/EventList.js';
import FilterPanel from '../../components/FilterPanel/FilterPanel.js';
import { useEffect } from 'react';


const ListView = () => {
  useEffect(() => {
    document.title = "Seattle Show & Open Mic List"
  });

  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
}

export default ListView;