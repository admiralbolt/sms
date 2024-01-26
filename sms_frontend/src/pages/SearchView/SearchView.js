import Search from '../../components/Search/Search.js';
import { usePageTitle, usePageDescription } from '../../hooks/metaTags.js';


const SearchView = () => {
  usePageTitle("Seattle Show & Open Mic Search");
  usePageDescription("Search all shows & open mics happening in Seattle.");

  return (
    <div style={{ padding: "12px 5px 5px 5px" }}>
      <Search />
    </div>
  );
}

export default SearchView;