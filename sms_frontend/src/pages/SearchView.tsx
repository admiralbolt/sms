import { Search } from "@/components/Search";
import { setMeta } from "@/utils/seo";

export const SearchView = () => {
  setMeta({
    title: "Seattle Show & Open Mic Search",
    description: "Search all shows & open mics happening in Seattle.",
  });

  return (
    <div style={{ padding: "12px 5px 5px 5px" }}>
      <Search />
    </div>
  );
};
