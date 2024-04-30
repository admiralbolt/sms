import EventList from "@/components/Events/EventList";
import FilterPanel from "@/components/FilterPanel/FilterPanel";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

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
