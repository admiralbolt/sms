import { FilterPanel } from "@/components";
import { usePageTitle, usePageDescription } from "@/hooks/metaTags";
import { EventList } from "./EventList";

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
