import { EventList } from "@/components/Events";
import { FilterPanel } from "@/components/FilterPanel";
import { setMeta } from "@/utils/seo";

export const ListView = () => {
  setMeta({
    title: "Seattle Show & Open Mic List",
    description: "See a list of all shows & open mics in Seattle.",
  });

  return (
    <div className="md:max-w-[70vw]">
      <FilterPanel />
      <EventList />
    </div>
  );
};
