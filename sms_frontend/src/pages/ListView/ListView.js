import EventList from '../../components/EventList/EventList.js';
import FilterPanel from '../../components/FilterPanel/FilterPanel.js';
import { usePageTitle, usePageDescription } from '../../hooks/metaTags.js';


const ListView = () => {
  usePageTitle("Seattle Show & Open Mic List");
  usePageDescription("See a list of all shows & open mics in Seattle.");

  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
}

export default ListView;