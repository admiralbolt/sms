import { Search } from "@/components/Search";
import { usePageDescription, usePageTitle } from "@/hooks/metaTags";

export const SearchView = () => {
  usePageTitle("Seattle Show & Open Mic Search");
  usePageDescription("Search all shows & open mics happening in Seattle.");

  return (
    <div style={{ padding: "12px 5px 5px 5px" }}>
      <Search />
    </div>
  );
};
