import EventList from "../components/EventList/EventList";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import { usePageTitle, usePageDescription } from "../hooks/metaTags";

const ListView = () => {
  usePageTitle("Seattle Show & Open Mic List");
  usePageDescription("See a list of all shows & open mics in Seattle.");

  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
};

export default ListView;
