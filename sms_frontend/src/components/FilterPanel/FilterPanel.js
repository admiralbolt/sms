import React, { useState } from 'react';
import SlidingPanel from 'react-sliding-side-panel';

import './FilterPanel.css';

const FilterPanel = () => {
  const [openPanel, setOpenPanel] = useState(true);
  return (
    <div class='filter-panel-wrapper'>
      <div>
        <button onClick={() => setOpenPanel(true)}>Open</button>
      </div>
      <SlidingPanel
        type={'left'}
        isOpen={openPanel}
        size={30}
      >
        <div>
          <h1>MY PANEL CONTENT</h1>
          <button onClick={() => setOpenPanel(false)}>close</button>
        </div>
      </SlidingPanel>
    </div>
  );
};
 
export default FilterPanel