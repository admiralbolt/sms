"""Utils related to Events."""
from typing import Optional

from api.models import Event, Venue

def get_event_by_name(venue: Venue, title: str) -> Optional[Event]:
  """Get event object by venue and title."""
  return Event.objects.filter(venue=venue, title=title).first()

def get_or_create_event(venue: Venue, title: str, event_day: str, start_time: str, ticket_price_min: float, ticket_price_max: float, event_url: str = "") -> Event:
  """Get or create an event.
  """
  event = get_event_by_name(venue, title)
  if event:
    return event

  event, _ = Event.objects.get_or_create(
    venue=venue,
    title=title,
    event_day=event_day,
    start_time=start_time,
    ticket_price_min=ticket_price_min,
    ticket_price_max=ticket_price_max,
    event_url=event_url
  )
  return event
    