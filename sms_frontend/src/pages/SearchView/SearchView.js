import Search from '../../components/Search/Search.js';
import { useEffect } from 'react';


const SearchView = () => {
  useEffect(() => {
    document.title = "Seattle Show & Open Mic Search"
  });

  return (
    <div style={{ padding: "12px 5px 5px 5px" }}>
      <Search />
    </div>
  );
}

export default SearchView;