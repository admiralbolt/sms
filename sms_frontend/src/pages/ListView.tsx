import { EventList } from "@/components/Events";
import { FilterPanel } from "@/components/FilterPanel";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

export const ListView = () => {
  usePageTitle("Seattle Show & Open Mic List");
  usePageDescription("See a list of all shows & open mics in Seattle.");

  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
};
