import EventList from '../../components/EventList/EventList.js';
import FilterPanel from '../../components/FilterPanel/FilterPanel.js';

const ListView = () => {
  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
}

export default ListView;