import React, { useState } from 'react';

import { useEvents, useVenues } from '../../api/api';

import './FilterPanel.css';

const FilterPanel = () => {
  const [eventsByVenue, eventsByDate, eventTypes] = useEvents();
  const [venues, venueTypes] = useVenues();

  return (
    <div class='filter-panel-wrapper'>
      <ul>
        {eventTypes.map((type) => (
          <li>{type}</li>
        ))}
      </ul>

      <ul>
        {venueTypes.map((type) => (
          <li>{type}</li>
        ))}
      </ul>
    </div>
  )
};
 
export default FilterPanel