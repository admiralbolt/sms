import EventList from '../../components/EventList/EventList.js';
import FilterPanel from '../../components/FilterPanel/FilterPanel.js';

const CalendarView = () => {
  return (
    <div>
      <FilterPanel />
      <EventList />
    </div>
  );
}

export default CalendarView;