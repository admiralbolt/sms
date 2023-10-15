"""Utils related to Events."""

from api.models import Event, Venue

def get_or_create_event(venue: Venue, title: str, event_day: str, start_time: str, ticket_price_min: float, ticket_price_max: float, event_url: str = "") -> Event:
  """Get or create an event.
  
  This is currently just a thin wrapper around the existing Event.objects
  method, but is created in case extra processing needs to be done in the
  future when creating an event.
  """
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
    